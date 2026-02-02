/**
 * JWT auth: access token (1h) and refresh token (7d, stored in DB).
 * Secrets from config/env.js.
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const RefreshTokenModel = require('../models/RefreshToken');

function issueAccessToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.accessTokenExpiresIn });
}

function issueRefreshToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.refreshTokenExpiresIn });
}

/** Returns a random string for refresh token storage (hashed in DB). */
function generateRefreshTokenString() {
  return crypto.randomBytes(40).toString('hex');
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch {
    return null;
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch {
    return null;
  }
}

/**
 * Creates refresh token: store hashed in DB, return plain string to client.
 * expiresIn e.g. '7d' -> Date.
 */
function getRefreshTokenExpiry() {
  const d = new Date();
  const match = (env.refreshTokenExpiresIn || '7d').match(/^(\d+)([dhms])$/);
  if (match) {
    const n = parseInt(match[1], 10);
    const u = match[2];
    if (u === 'd') d.setDate(d.getDate() + n);
    else if (u === 'h') d.setHours(d.getHours() + n);
    else if (u === 'm') d.setMinutes(d.getMinutes() + n);
    else if (u === 's') d.setSeconds(d.getSeconds() + n);
  } else {
    d.setDate(d.getDate() + 7);
  }
  return d;
}

async function createStoredRefreshToken(userId) {
  const plain = generateRefreshTokenString();
  const expiresAt = getRefreshTokenExpiry();
  await RefreshTokenModel.create(userId, plain, expiresAt);
  return { plain, expiresAt };
}

async function findUserByStoredRefreshToken(plainToken) {
  const row = await RefreshTokenModel.findByToken(plainToken);
  return row ? { userId: row.user_id } : null;
}

async function revokeRefreshToken(plainToken) {
  return RefreshTokenModel.revokeByToken(plainToken);
}

/**
 * Extracts Bearer token from Authorization header and attaches user to req (access token only).
 */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  req.user = token ? verifyAccessToken(token) : null;
  next();
}

module.exports = {
  issueAccessToken,
  issueRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  createStoredRefreshToken,
  findUserByStoredRefreshToken,
  revokeRefreshToken,
  authMiddleware,
};
