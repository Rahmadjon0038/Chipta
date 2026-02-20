const { getDb } = require('../db/database');

const WEEK_DAYS_UZ = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

function isValidDate(dateText) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return false;
  const [year, month, day] = dateText.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidTime(timeText) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeText);
}

function toTicketResponse(row) {
  const weekdayIndex = row.flightDate && isValidDate(row.flightDate)
    ? new Date(`${row.flightDate}T00:00:00Z`).getUTCDay()
    : null;

  return {
    ...row,
    flightWeekday: weekdayIndex === null ? null : WEEK_DAYS_UZ[weekdayIndex],
    cartItemsCount: row.cartItemsCount !== undefined ? Number(row.cartItemsCount) : undefined,
    cartTotalQuantity: row.cartTotalQuantity !== undefined ? Number(row.cartTotalQuantity) : undefined
  };
}

async function getTicketDetails(db, id) {
  const row = await db.get(
    `SELECT t.id,
            t.image,
            t.from_city AS fromCity,
            t.to_city AS toCity,
            t.price,
            t.class,
            t.description,
            t.flight_date AS flightDate,
            t.flight_time AS flightTime,
            t.created_at AS createdAt,
            (SELECT COUNT(*) FROM cart_items c WHERE c.ticket_id = t.id) AS cartItemsCount,
            COALESCE((SELECT SUM(c.quantity) FROM cart_items c WHERE c.ticket_id = t.id), 0) AS cartTotalQuantity
     FROM tickets t
     WHERE t.id = ?`,
    [id]
  );

  if (!row) return null;

  return toTicketResponse(row);
}

async function listTickets(req, res) {
  const db = getDb();
  const rows = await db.all(
    `SELECT id,
            image,
            from_city AS fromCity,
            to_city AS toCity,
            price,
            class,
            description,
            flight_date AS flightDate,
            flight_time AS flightTime,
            created_at AS createdAt
     FROM tickets ORDER BY id ASC`
  );

  return res.json(rows.map(toTicketResponse));
}

async function getTicketById(req, res) {
  const { id } = req.params;
  const db = getDb();

  const row = await getTicketDetails(db, id);

  if (!row) {
    return res.status(404).json({ message: 'Chipta topilmadi' });
  }

  return res.json(row);
}

async function createTicket(req, res) {
  const { image, fromCity, toCity, price, class: ticketClass, description, flightDate, flightTime } = req.body;

  if (!image || !fromCity || !toCity || !price || !ticketClass || !flightDate || !flightTime) {
    return res.status(400).json({ message: 'Kerakli maydonlar: image, fromCity, toCity, price, class, flightDate, flightTime' });
  }

  if (!isValidDate(flightDate)) {
    return res.status(400).json({ message: 'flightDate formati noto\'g\'ri. Format: YYYY-MM-DD' });
  }

  if (!isValidTime(flightTime)) {
    return res.status(400).json({ message: 'flightTime formati noto\'g\'ri. Format: HH:mm' });
  }

  const db = getDb();

  const result = await db.run(
    `INSERT INTO tickets (image, from_city, to_city, price, class, description, flight_date, flight_time)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [image, fromCity, toCity, price, ticketClass, description || null, flightDate, flightTime]
  );

  const newTicket = await getTicketDetails(db, result.lastID);

  return res.status(201).json(newTicket);
}

async function updateTicket(req, res) {
  const { id } = req.params;
  const { image, fromCity, toCity, price, class: ticketClass, description, flightDate, flightTime } = req.body;

  if (flightDate !== undefined && !isValidDate(flightDate)) {
    return res.status(400).json({ message: 'flightDate formati noto\'g\'ri. Format: YYYY-MM-DD' });
  }

  if (flightTime !== undefined && !isValidTime(flightTime)) {
    return res.status(400).json({ message: 'flightTime formati noto\'g\'ri. Format: HH:mm' });
  }

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
         description = COALESCE(?, description),
         flight_date = COALESCE(?, flight_date),
         flight_time = COALESCE(?, flight_time)
     WHERE id = ?`,
    [
      image || null,
      fromCity || null,
      toCity || null,
      price || null,
      ticketClass || null,
      description || null,
      flightDate || null,
      flightTime || null,
      id
    ]
  );

  const updated = await getTicketDetails(db, id);

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
