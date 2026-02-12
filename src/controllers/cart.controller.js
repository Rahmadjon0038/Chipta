const { getDb } = require('../db/database');

async function getMyCart(req, res) {
  const db = getDb();
  const rows = await db.all(
    `SELECT c.id, c.quantity,
            t.id AS ticketId,
            t.image,
            t.from_city AS fromCity,
            t.to_city AS toCity,
            t.price,
            t.class,
            t.description
     FROM cart_items c
     JOIN tickets t ON t.id = c.ticket_id
     WHERE c.user_id = ?
     ORDER BY c.id DESC`,
    [req.user.sub]
  );

  return res.json(rows);
}

async function addToCart(req, res) {
  const { ticketId, quantity } = req.body;

  if (!ticketId) {
    return res.status(400).json({ message: 'ticketId majburiy' });
  }

  const qty = Number(quantity) > 0 ? Number(quantity) : 1;
  const db = getDb();

  const ticket = await db.get('SELECT id FROM tickets WHERE id = ?', [ticketId]);
  if (!ticket) {
    return res.status(404).json({ message: 'Chipta topilmadi' });
  }

  const existing = await db.get(
    'SELECT id, quantity FROM cart_items WHERE user_id = ? AND ticket_id = ?',
    [req.user.sub, ticketId]
  );

  if (existing) {
    await db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [existing.quantity + qty, existing.id]);
  } else {
    await db.run(
      'INSERT INTO cart_items (user_id, ticket_id, quantity) VALUES (?, ?, ?)',
      [req.user.sub, ticketId, qty]
    );
  }

  return res.status(201).json({ message: 'Savatchaga qo\'shildi' });
}

async function updateCartItem(req, res) {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || Number(quantity) < 1) {
    return res.status(400).json({ message: 'quantity kamida 1 bo\'lishi kerak' });
  }

  const db = getDb();
  const item = await db.get('SELECT id FROM cart_items WHERE id = ? AND user_id = ?', [id, req.user.sub]);

  if (!item) {
    return res.status(404).json({ message: 'Savatcha elementi topilmadi' });
  }

  await db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [Number(quantity), id]);
  return res.json({ message: 'Savatcha yangilandi' });
}

async function removeCartItem(req, res) {
  const { id } = req.params;
  const db = getDb();

  const item = await db.get('SELECT id FROM cart_items WHERE id = ? AND user_id = ?', [id, req.user.sub]);
  if (!item) {
    return res.status(404).json({ message: 'Savatcha elementi topilmadi' });
  }

  await db.run('DELETE FROM cart_items WHERE id = ?', [id]);
  return res.json({ message: 'Savatchadan o\'chirildi' });
}

module.exports = {
  getMyCart,
  addToCart,
  updateCartItem,
  removeCartItem
};
