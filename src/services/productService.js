const { pool } = require('../db');

class ProductService {
  async listProducts() {
    const { rows } = await pool.query(`
      SELECT id, name, description, price, stock, is_active, created_at
      FROM products
      WHERE is_active = TRUE
      ORDER BY id
    `);
    return rows;
  }

  async getProductById(productId) {
    const { rows } = await pool.query(`
      SELECT id, name, description, price, stock, is_active, created_at
      FROM products
      WHERE id = $1 AND is_active = TRUE
      LIMIT 1
    `, [productId]);

    return rows[0] || null;
  }

  async createProduct({ name, description, price, stock }) {
    const { rows } = await pool.query(`
      INSERT INTO products (name, description, price, stock, is_active)
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING id, name, description, price, stock, is_active, created_at
    `, [name, description || '', Number(price), Number(stock || 0)]);

    return rows[0];
  }
}

module.exports = new ProductService();
