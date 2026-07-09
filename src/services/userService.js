const { pool } = require('../db');

class UserService {
  async getUserById(id) {
    const query = 'SELECT id, name, email, created_at FROM users WHERE id = $1 LIMIT 1';
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = new UserService();
