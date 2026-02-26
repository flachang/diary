export interface Entry {
  id: number;
  date: string;
  title: string;
  content: string;
  mood: string;
  tags: string;
  created_at: string;
}

export type MoodType = 'happy' | 'calm' | 'sad' | 'tired' | 'excited' | 'peaceful';

export const MOODS: { type: MoodType; label: string; emoji: string; color: string }[] = [
  { type: 'happy', label: '开心', emoji: '😊', color: 'bg-yellow-100' },
  { type: 'calm', label: '平静', emoji: '😌', color: 'bg-blue-100' },
  { type: 'peaceful', label: '安宁', emoji: '🌿', color: 'bg-green-100' },
  { type: 'excited', label: '激动', emoji: '✨', color: 'bg-orange-100' },
  { type: 'tired', label: '疲惫', emoji: '😴', color: 'bg-purple-100' },
  { type: 'sad', label: '难过', emoji: '☁️', color: 'bg-gray-100' },
];
