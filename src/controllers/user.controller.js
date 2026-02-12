const { getDb } = require('../db/database');

async function getMe(req, res) {
  const db = getDb();
  const user = await db.get(
    `SELECT id, first_name AS firstName, last_name AS lastName, phone, role, created_at AS createdAt
     FROM users WHERE id = ?`,
    [req.user.sub]
  );

  if (!user) {
    return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
  }

  return res.json(user);
}

module.exports = {
  getMe
};
