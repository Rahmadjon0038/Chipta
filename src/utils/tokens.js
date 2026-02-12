const jwt = require('jsonwebtoken');
const config = require('../config/env');

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, phone: user.phone },
    config.jwtAccessSecret,
    { expiresIn: config.accessTokenExpiresIn }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, type: 'refresh' },
    config.jwtRefreshSecret,
    { expiresIn: config.refreshTokenExpiresIn }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtAccessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwtRefreshSecret);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
