import { DatabaseSync } from "node:sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "portfolio.sqlite");

export const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");

db.exec(`
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  tagline TEXT,
  bio TEXT,
  email TEXT,
  location TEXT,
  cv_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  brand_name TEXT,
  brand_tagline TEXT
);
`);

// Migración simple para bases creadas antes de agregar brand_name/brand_tagline.
const profileColumns = db.prepare("PRAGMA table_info(profile)").all().map((c) => c.name);
if (!profileColumns.includes("brand_name")) {
  db.exec("ALTER TABLE profile ADD COLUMN brand_name TEXT");
}
if (!profileColumns.includes("brand_tagline")) {
  db.exec("ALTER TABLE profile ADD COLUMN brand_tagline TEXT");
}

db.exec(`

CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 50,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS experience (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL,
  organization TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  year TEXT,
  icon TEXT DEFAULT 'bi-award',
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  tech TEXT,
  repo_url TEXT,
  demo_url TEXT,
  featured INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

export default db;
