import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_FILE ? path.resolve(process.cwd(), process.env.DB_FILE) : path.resolve(__dirname, '../../bookings.db');

sqlite3.verbose();

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite Database at:', dbPath);
  }
});

db.run('PRAGMA foreign_keys = ON');

export function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

const roomMutexes = new Map();

export async function withRoomLock(roomId, fn) {
  if (!roomMutexes.has(roomId)) {
    roomMutexes.set(roomId, Promise.resolve());
  }

  const previousLock = roomMutexes.get(roomId);

  let resolveNextLock;
  const nextLock = new Promise((resolve) => {
    resolveNextLock = resolve;
  });

  roomMutexes.set(roomId, previousLock.then(() => nextLock));

  await previousLock;

  try {
    return await fn();
  } finally {
    resolveNextLock();
  }
}

export async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      capacity INTEGER NOT NULL,
      floor INTEGER NOT NULL,
      amenities TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roomId INTEGER NOT NULL,
      title TEXT NOT NULL,
      organizerEmail TEXT NOT NULL,
      attendees INTEGER NOT NULL,
      start TEXT NOT NULL,
      end TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (roomId) REFERENCES rooms (id)
    )
  `);

  const rooms = await query('SELECT * FROM rooms');
  if (rooms.length === 0) {
    const seedRooms = [
      { name: 'Atlas', capacity: 4, floor: 1, amenities: 'monitor' },
      { name: 'Borealis', capacity: 8, floor: 1, amenities: 'projector, whiteboard' },
      { name: 'Cascade', capacity: 12, floor: 2, amenities: 'projector, video-conferencing' },
      { name: 'Delta', capacity: 20, floor: 3, amenities: 'projector, video-conferencing, whiteboard' },
      { name: 'Ember', capacity: 2, floor: 2, amenities: '(none)' }
    ];

    for (const r of seedRooms) {
      await run(
        'INSERT INTO rooms (name, capacity, floor, amenities) VALUES (?, ?, ?, ?)',
        [r.name, r.capacity, r.floor, r.amenities]
      );
    }
  }
}

export default db;
