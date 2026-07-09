const { pool } = require('../db');

class CartService {
  async getCartItems(userId) {
    const { rows } = await pool.query(`
      SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.stock
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = $1
      ORDER BY ci.id
    `, [userId]);
    return rows;
  }

  async addItem(userId, productId, quantity) {
    const productResult = await pool.query(`
      SELECT id, name, stock
      FROM products
      WHERE id = $1 AND is_active = TRUE
      LIMIT 1
    `, [productId]);

    if (!productResult.rows[0]) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    const requestedQty = Number(quantity);
    if (requestedQty > productResult.rows[0].stock) {
      const error = new Error('Not enough stock available');
      error.statusCode = 400;
      throw error;
    }

    const { rows } = await pool.query(`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
      RETURNING id, product_id, quantity
    `, [userId, productId, requestedQty]);

    return rows[0];
  }

  async updateItem(userId, productId, quantity) {
    const productResult = await pool.query(`
      SELECT stock
      FROM products
      WHERE id = $1 AND is_active = TRUE
      LIMIT 1
    `, [productId]);

    if (!productResult.rows[0]) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (quantity > productResult.rows[0].stock) {
      const error = new Error('Not enough stock available');
      error.statusCode = 400;
      throw error;
    }

    const { rowCount } = await pool.query(`
      UPDATE cart_items
      SET quantity = $1
      WHERE user_id = $2 AND product_id = $3
    `, [quantity, userId, productId]);

    if (rowCount === 0) {
      const error = new Error('Cart item not found');
      error.statusCode = 404;
      throw error;
    }
  }

  async removeItem(userId, productId) {
    const { rowCount } = await pool.query(`
      DELETE FROM cart_items
      WHERE user_id = $1 AND product_id = $2
    `, [userId, productId]);

    if (rowCount === 0) {
      const error = new Error('Cart item not found');
      error.statusCode = 404;
      throw error;
    }
  }
}

module.exports = new CartService();
