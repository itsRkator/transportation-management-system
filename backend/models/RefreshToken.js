/**
 * RefreshToken model - stores hashed refresh tokens for rotation/revocation.
 */
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

class RefreshTokenModel {
  static async create(userId, tokenPlain, expiresAt) {
    const tokenHash = await bcrypt.hash(tokenPlain, SALT_ROUNDS);
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );
  }

  static async findByToken(tokenPlain) {
    const { rows } = await pool.query(
      'SELECT id, user_id, token_hash, expires_at FROM refresh_tokens WHERE expires_at > NOW()'
    );
    for (const row of rows) {
      const match = await bcrypt.compare(tokenPlain, row.token_hash);
      if (match) return { id: row.id, user_id: row.user_id, expires_at: row.expires_at };
    }
    return null;
  }

  static async revokeById(id) {
    const { rowCount } = await pool.query('DELETE FROM refresh_tokens WHERE id = $1', [id]);
    return rowCount > 0;
  }

  static async revokeByToken(tokenPlain) {
    const row = await RefreshTokenModel.findByToken(tokenPlain);
    if (row) return RefreshTokenModel.revokeById(row.id);
    return false;
  }

  static async revokeAllForUser(userId) {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  }

  static async deleteExpired() {
    const { rowCount } = await pool.query('DELETE FROM refresh_tokens WHERE expires_at <= NOW()');
    return rowCount;
  }
}

module.exports = RefreshTokenModel;
