import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'wellness.db');
export const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

// Initialize database tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      preferred_language TEXT DEFAULT 'en',
      theme TEXT DEFAULT 'light',
      wellness_goal TEXT DEFAULT 'Mental wellbeing and emotional awareness',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      language TEXT DEFAULT 'en',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      detected_emotion TEXT,
      intensity TEXT,
      confidence REAL,
      input_modality TEXT DEFAULT 'text',
      multimodal_context_json TEXT,
      follow_up_question TEXT,
      suggestions_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS emotion_analyses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      input_mode TEXT NOT NULL,
      primary_emotion TEXT NOT NULL,
      secondary_emotions_json TEXT,
      intensity TEXT NOT NULL,
      confidence REAL,
      input_text_or_summary TEXT,
      explanation TEXT,
      indicators_json TEXT,
      suggestions_json TEXT,
      follow_up_question TEXT,
      language TEXT DEFAULT 'en',
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      title TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 5,
      notes TEXT,
      completed_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Ensure default clean guest session user exists with no fake personal information
  const existingGuest = db.prepare('SELECT id FROM users WHERE id = ?').get('guest_user');
  if (!existingGuest) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, preferred_language, theme, wellness_goal, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('guest_user', '', 'guest@local', '', 'en', 'light', 'Stress Management', now);
  }
}
