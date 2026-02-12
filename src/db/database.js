const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const tickets = require('../data/tickets');

let db;

async function initializeDatabase() {
  if (db) return db;

  db = await open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      revoked INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY,
      image TEXT NOT NULL,
      from_city TEXT NOT NULL,
      to_city TEXT NOT NULL,
      price TEXT NOT NULL,
      class TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ticket_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
      UNIQUE(user_id, ticket_id)
    );
  `);

  const ticketCount = await db.get('SELECT COUNT(*) AS count FROM tickets');

  if (ticketCount.count === 0) {
    for (const ticket of tickets) {
      await db.run(
        `INSERT INTO tickets (id, image, from_city, to_city, price, class, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          ticket.id,
          ticket.image,
          ticket.from,
          ticket.to,
          ticket.price,
          ticket.class,
          `${ticket.from} -> ${ticket.to} yo'nalishi uchun ${ticket.class} klass chipta`
        ]
      );
    }
  }

  const adminPhone = '+998900000000';
  const existingAdmin = await db.get('SELECT id FROM users WHERE phone = ?', [adminPhone]);

  if (!existingAdmin) {
    const hash = await bcrypt.hash('admin12345', 10);
    await db.run(
      `INSERT INTO users (first_name, last_name, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      ['System', 'Admin', adminPhone, hash, 'admin']
    );
  }

  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

module.exports = {
  initializeDatabase,
  getDb
};
