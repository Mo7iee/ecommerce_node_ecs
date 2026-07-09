const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

class AuthService {
  async register({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at';
    const values = [name, email, hashedPassword];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async login({ email, password }) {
    const query = 'SELECT id, name, email, password FROM users WHERE email = $1 LIMIT 1';
    const { rows } = await pool.query(query, [email]);
    const user = rows[0] || null;

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return token;
  }
}

module.exports = new AuthService();
