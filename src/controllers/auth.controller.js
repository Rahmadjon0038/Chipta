const bcrypt = require('bcryptjs');
const { getDb } = require('../db/database');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require('../utils/tokens');

function buildUserResponse(user) {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    role: user.role,
    createdAt: user.created_at
  };
}

async function register(req, res) {
  const { firstName, lastName, phone, password } = req.body;

  if (!firstName || !lastName || !phone || !password) {
    return res.status(400).json({ message: 'Barcha maydonlar to\'ldirilishi shart' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Parol kamida 6 ta belgidan iborat bo\'lsin' });
  }

  const db = getDb();
  const existing = await db.get('SELECT id FROM users WHERE phone = ?', [phone]);

  if (existing) {
    return res.status(409).json({ message: 'Bu telefon raqam oldin ro\'yxatdan o\'tgan' });
  }

  const hash = await bcrypt.hash(password, 10);

  const result = await db.run(
    `INSERT INTO users (first_name, last_name, phone, password_hash, role)
     VALUES (?, ?, ?, ?, 'user')`,
    [firstName, lastName, phone, hash]
  );

  const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const refreshPayload = verifyRefreshToken(refreshToken);
  await db.run(
    'INSERT INTO refresh_tokens (user_id, token, expires_at, revoked) VALUES (?, ?, ?, 0)',
    [user.id, refreshToken, new Date(refreshPayload.exp * 1000).toISOString()]
  );

  return res.status(201).json({
    message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz',
    user: buildUserResponse(user),
    tokens: { accessToken, refreshToken }
  });
}

async function login(req, res) {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: 'Telefon raqam va parol majburiy' });
  }

  const db = getDb();
  const user = await db.get('SELECT * FROM users WHERE phone = ?', [phone]);

  if (!user) {
    return res.status(401).json({ message: 'Telefon raqam yoki parol xato' });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ message: 'Telefon raqam yoki parol xato' });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const refreshPayload = verifyRefreshToken(refreshToken);

  await db.run(
    'INSERT INTO refresh_tokens (user_id, token, expires_at, revoked) VALUES (?, ?, ?, 0)',
    [user.id, refreshToken, new Date(refreshPayload.exp * 1000).toISOString()]
  );

  return res.json({
    message: 'Muvaffaqiyatli login bo\'ldi',
    user: buildUserResponse(user),
    tokens: { accessToken, refreshToken }
  });
}

async function refresh(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'refreshToken majburiy' });
  }

  const db = getDb();
  const tokenRow = await db.get(
    'SELECT * FROM refresh_tokens WHERE token = ? AND revoked = 0',
    [refreshToken]
  );

  if (!tokenRow) {
    return res.status(401).json({ message: 'Refresh token yaroqsiz' });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await db.get('SELECT * FROM users WHERE id = ?', [payload.sub]);

    if (!user) {
      return res.status(401).json({ message: 'Foydalanuvchi topilmadi' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const newRefreshPayload = verifyRefreshToken(newRefreshToken);

    await db.run('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?', [tokenRow.id]);
    await db.run(
      'INSERT INTO refresh_tokens (user_id, token, expires_at, revoked) VALUES (?, ?, ?, 0)',
      [user.id, newRefreshToken, new Date(newRefreshPayload.exp * 1000).toISOString()]
    );

    return res.json({
      message: 'Tokenlar yangilandi',
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    await db.run('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?', [tokenRow.id]);
    return res.status(401).json({ message: 'Refresh token muddati tugagan yoki xato' });
  }
}

async function logout(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'refreshToken majburiy' });
  }

  const db = getDb();
  await db.run('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?', [refreshToken]);

  return res.json({ message: 'Tizimdan chiqdingiz' });
}

module.exports = {
  register,
  login,
  refresh,
  logout
};
