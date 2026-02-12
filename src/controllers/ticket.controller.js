const { getDb } = require('../db/database');

async function listTickets(req, res) {
  const db = getDb();
  const rows = await db.all(
    `SELECT id, image, from_city AS fromCity, to_city AS toCity, price, class, description, created_at AS createdAt
     FROM tickets ORDER BY id ASC`
  );

  return res.json(rows);
}

async function getTicketById(req, res) {
  const { id } = req.params;
  const db = getDb();

  const row = await db.get(
    `SELECT id, image, from_city AS fromCity, to_city AS toCity, price, class, description, created_at AS createdAt
     FROM tickets WHERE id = ?`,
    [id]
  );

  if (!row) {
    return res.status(404).json({ message: 'Chipta topilmadi' });
  }

  return res.json(row);
}

async function createTicket(req, res) {
  const { image, fromCity, toCity, price, class: ticketClass, description } = req.body;

  if (!image || !fromCity || !toCity || !price || !ticketClass) {
    return res.status(400).json({ message: 'Kerakli maydonlar: image, fromCity, toCity, price, class' });
  }

  const db = getDb();

  const result = await db.run(
    `INSERT INTO tickets (image, from_city, to_city, price, class, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [image, fromCity, toCity, price, ticketClass, description || null]
  );

  const newTicket = await db.get(
    `SELECT id, image, from_city AS fromCity, to_city AS toCity, price, class, description, created_at AS createdAt
     FROM tickets WHERE id = ?`,
    [result.lastID]
  );

  return res.status(201).json(newTicket);
}

async function updateTicket(req, res) {
  const { id } = req.params;
  const { image, fromCity, toCity, price, class: ticketClass, description } = req.body;

  const db = getDb();
  const exists = await db.get('SELECT id FROM tickets WHERE id = ?', [id]);

  if (!exists) {
    return res.status(404).json({ message: 'Chipta topilmadi' });
  }

  await db.run(
    `UPDATE tickets
     SET image = COALESCE(?, image),
         from_city = COALESCE(?, from_city),
         to_city = COALESCE(?, to_city),
         price = COALESCE(?, price),
         class = COALESCE(?, class),
         description = COALESCE(?, description)
     WHERE id = ?`,
    [image || null, fromCity || null, toCity || null, price || null, ticketClass || null, description || null, id]
  );

  const updated = await db.get(
    `SELECT id, image, from_city AS fromCity, to_city AS toCity, price, class, description, created_at AS createdAt
     FROM tickets WHERE id = ?`,
    [id]
  );

  return res.json(updated);
}

async function deleteTicket(req, res) {
  const { id } = req.params;
  const db = getDb();

  const exists = await db.get('SELECT id FROM tickets WHERE id = ?', [id]);
  if (!exists) {
    return res.status(404).json({ message: 'Chipta topilmadi' });
  }

  await db.run('DELETE FROM tickets WHERE id = ?', [id]);
  return res.json({ message: 'Chipta o\'chirildi' });
}

module.exports = {
  listTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket
};
