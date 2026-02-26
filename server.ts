import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("techo.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    title TEXT,
    content TEXT,
    mood TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/entries", (req, res) => {
    const entries = db.prepare("SELECT * FROM entries ORDER BY date DESC").all();
    res.json(entries);
  });

  app.post("/api/entries", (req, res) => {
    const { date, title, content, mood, tags } = req.body;
    const info = db.prepare(
      "INSERT INTO entries (date, title, content, mood, tags) VALUES (?, ?, ?, ?, ?)"
    ).run(date, title, content, mood, tags);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/entries/:id", (req, res) => {
    const { title, content, mood, tags } = req.body;
    db.prepare(
      "UPDATE entries SET title = ?, content = ?, mood = ?, tags = ? WHERE id = ?"
    ).run(title, content, mood, tags, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/entries/:id", (req, res) => {
    db.prepare("DELETE FROM entries WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
