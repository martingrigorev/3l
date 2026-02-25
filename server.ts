import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

// Database setup
const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'progress.db');
// Ensure directory exists if needed, but better-sqlite3 handles file creation if dir exists.
// In Docker, we'll map /app/data to a volume.

let db: Database.Database;

try {
  db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      letter TEXT PRIMARY KEY,
      stars INTEGER
    )
  `);
  console.log(`Connected to database at ${dbPath}`);
} catch (err) {
  console.error('Failed to connect to database:', err);
  // Fallback to in-memory for dev if file fails (though unlikely)
  db = new Database(':memory:');
  db.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      letter TEXT PRIMARY KEY,
      stars INTEGER
    )
  `);
  console.log('Connected to in-memory database fallback');
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.get('/api/progress', (req, res) => {
  try {
    const rows = db.prepare('SELECT letter, stars FROM progress').all() as { letter: string, stars: number }[];
    const progress: Record<string, number> = {};
    rows.forEach(row => {
      progress[row.letter] = row.stars;
    });
    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

app.post('/api/progress', (req, res) => {
  const { letter, stars } = req.body;
  if (!letter || typeof stars !== 'number') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO progress (letter, stars) VALUES (?, ?)
      ON CONFLICT(letter) DO UPDATE SET stars = excluded.stars
    `);
    stmt.run(letter, stars);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

app.delete('/api/progress', (req, res) => {
  try {
    db.prepare('DELETE FROM progress').run();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset progress' });
  }
});

// Serve frontend
if (isProduction) {
  // Serve static files from dist
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Handle SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Use Vite middleware for dev
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
