/**
 * JWT auth middleware - issues and verifies tokens.
 * Secrets must come from env (see config/env.js).
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function issueToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch {
    return null;
  }
}

/**
 * Extracts Bearer token from Authorization header and attaches user to req.
 */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  req.user = token ? verifyToken(token) : null;
  next();
}

module.exports = { issueToken, verifyToken, authMiddleware };
