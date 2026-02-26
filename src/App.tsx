/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Settings, 
  BookOpen, 
  Heart, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  X,
  Save,
  Tag
} from 'lucide-react';
import { Entry, MoodType, MOODS } from './types';

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<Entry> | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/entries');
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    }
  };

  const handleSaveEntry = async () => {
    if (!editingEntry) return;

    const method = editingEntry.id ? 'PUT' : 'POST';
    const url = editingEntry.id ? `/api/entries/${editingEntry.id}` : '/api/entries';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingEntry,
          date: editingEntry.date || new Date().toISOString().split('T')[0],
        }),
      });

      if (res.ok) {
        setIsEditorOpen(false);
        setEditingEntry(null);
        fetchEntries();
      }
    } catch (err) {
      console.error('Failed to save entry:', err);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      if (res.ok) fetchEntries();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(e => 
      e.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [entries, searchQuery]);

  const entriesByDate = useMemo(() => {
    const map: Record<string, Entry[]> = {};
    entries.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [entries]);

  const daysInMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    
    const result = [];
    for (let i = 0; i < firstDay; i++) result.push(null);
    for (let i = 1; i <= days; i++) result.push(i);
    return result;
  }, [viewDate]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper">
      {/* Sidebar / Navigation */}
      <aside className="w-full md:w-20 lg:w-64 border-r border-black/5 flex flex-col p-6 gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose/20">
            <Heart size={20} fill="currentColor" />
          </div>
          <h1 className="hidden lg:block font-serif text-xl font-bold tracking-tight">心语手帐</h1>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          <button className="flex items-center gap-3 p-3 rounded-xl bg-ink text-white shadow-md">
            <BookOpen size={20} />
            <span className="hidden lg:block font-medium">所有记录</span>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/5 text-ink/60 transition-colors">
            <CalendarIcon size={20} />
            <span className="hidden lg:block font-medium">日历视图</span>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/5 text-ink/60 transition-colors">
            <Tag size={20} />
            <span className="hidden lg:block font-medium">标签分类</span>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/5 text-ink/60 transition-colors">
            <Settings size={20} />
            <span className="hidden lg:block font-medium">设置</span>
          </button>
        </nav>

        <div className="mt-auto hidden lg:block">
          <div className="p-4 bg-sage/10 rounded-2xl border border-sage/20">
            <p className="text-xs text-sage font-medium uppercase tracking-wider mb-2">今日寄语</p>
            <p className="text-sm font-serif italic text-ink/70">“生活中的每一个瞬间，都值得被温柔记录。”</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="p-6 flex items-center justify-between border-b border-black/5">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={18} />
            <input 
              type="text" 
              placeholder="搜索手帐..." 
              className="w-full pl-10 pr-4 py-2 bg-black/5 rounded-full border-none focus:ring-2 focus:ring-rose/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => {
              setEditingEntry({ date: new Date().toISOString().split('T')[0], mood: 'calm' });
              setIsEditorOpen(true);
            }}
            className="ml-4 flex items-center gap-2 px-6 py-2 bg-rose text-white rounded-full shadow-lg shadow-rose/20 hover:scale-105 transition-transform active:scale-95"
          >
            <Plus size={20} />
            <span className="hidden sm:inline font-medium">写手帐</span>
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Calendar Widget */}
            <section className="techo-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold">
                  {viewDate.getFullYear()}年 {viewDate.getMonth() + 1}月
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                  <div key={d} className="text-center text-xs font-bold text-ink/30 py-2">{d}</div>
                ))}
                {daysInMonth.map((day, idx) => {
                  const dateStr = day ? `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                  const hasEntry = day && entriesByDate[dateStr];
                  const isToday = day && new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();

                  return (
                    <div 
                      key={idx} 
                      className={`
                        aspect-square flex flex-col items-center justify-center rounded-2xl relative cursor-pointer
                        ${day ? 'hover:bg-black/5' : ''}
                        ${isToday ? 'bg-rose/10 text-rose font-bold' : ''}
                      `}
                      onClick={() => {
                        if (day) {
                          const existing = entriesByDate[dateStr];
                          if (existing) {
                            setEditingEntry(existing[0]);
                          } else {
                            setEditingEntry({ date: dateStr, mood: 'calm' });
                          }
                          setIsEditorOpen(true);
                        }
                      }}
                    >
                      <span className="text-sm">{day}</span>
                      {hasEntry && (
                        <div className="absolute bottom-2 w-1.5 h-1.5 bg-rose rounded-full"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Recent Entries */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold">最近记录</h2>
                <span className="text-sm text-ink/40">{filteredEntries.length} 篇手帐</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredEntries.map((entry) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={entry.id}
                      className="techo-card group"
                    >
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${MOODS.find(m => m.type === entry.mood)?.color || 'bg-gray-100'}`}>
                              {MOODS.find(m => m.type === entry.mood)?.emoji || '😶'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-ink/30 uppercase tracking-widest">{formatDate(entry.date)}</p>
                              <h3 className="font-serif font-bold text-lg line-clamp-1">{entry.title || '无标题'}</h3>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setEditingEntry(entry);
                                setIsEditorOpen(true);
                              }}
                              className="p-2 hover:bg-black/5 rounded-full text-ink/40 hover:text-ink transition-colors"
                            >
                              <BookOpen size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="p-2 hover:bg-red-50 rounded-full text-ink/40 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-ink/60 line-clamp-3 font-serif leading-relaxed">
                          {entry.content}
                        </p>
                        {entry.tags && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {entry.tags.split(',').map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-black/5 rounded-md text-[10px] font-bold text-ink/40 uppercase tracking-wider">
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-paper rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-full"
            >
              <div className="p-6 flex items-center justify-between border-b border-black/5">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-1 bg-black/5 rounded-full text-sm font-bold text-ink/40">
                    {editingEntry?.date}
                  </div>
                  <div className="flex gap-1">
                    {MOODS.map(mood => (
                      <button
                        key={mood.type}
                        onClick={() => setEditingEntry(prev => ({ ...prev, mood: mood.type }))}
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all
                          ${editingEntry?.mood === mood.type ? 'scale-125 shadow-md ring-2 ring-rose/20' : 'opacity-40 hover:opacity-100'}
                          ${mood.color}
                        `}
                        title={mood.label}
                      >
                        {mood.emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsEditorOpen(false)}
                    className="p-2 hover:bg-black/5 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <button 
                    onClick={handleSaveEntry}
                    className="flex items-center gap-2 px-6 py-2 bg-ink text-white rounded-full shadow-lg hover:scale-105 transition-transform active:scale-95"
                  >
                    <Save size={18} />
                    <span className="font-medium">保存</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                <input 
                  type="text" 
                  placeholder="给今天起个标题吧..." 
                  className="techo-input text-4xl font-bold"
                  value={editingEntry?.title || ''}
                  onChange={(e) => setEditingEntry(prev => ({ ...prev, title: e.target.value }))}
                />
                
                <textarea 
                  placeholder="记录下此刻的想法..." 
                  className="techo-input text-xl min-h-[300px] resize-none leading-relaxed"
                  value={editingEntry?.content || ''}
                  onChange={(e) => setEditingEntry(prev => ({ ...prev, content: e.target.value }))}
                />

                <div className="pt-8 border-t border-black/5 flex items-center gap-4">
                  <Tag size={18} className="text-ink/30" />
                  <input 
                    type="text" 
                    placeholder="添加标签，用逗号分隔..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-ink/60"
                    value={editingEntry?.tags || ''}
                    onChange={(e) => setEditingEntry(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
