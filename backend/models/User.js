/**
 * User model - data access for users (MVC Model layer).
 */
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

class UserModel {
  static async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT id, email, password_hash, role, created_at FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  static async create({ email, password, role = 'employee' }) {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)
       RETURNING id, email, role, created_at`,
      [email, hash, role]
    );
    return rows[0];
  }

  static async verifyPassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  }
}

module.exports = UserModel;
