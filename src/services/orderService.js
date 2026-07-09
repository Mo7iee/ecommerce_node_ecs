const { pool } = require('../db');

class OrderService {
  async getOrders(userId) {
    const { rows } = await pool.query(`
      SELECT id, total_amount, status, created_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);
    return rows;
  }

  async getOrderById(userId, orderId) {
    const { rows } = await pool.query(`
      SELECT o.id, o.total_amount, o.status, o.created_at,
             json_agg(
               json_build_object(
                 'productId', oi.product_id,
                 'quantity', oi.quantity,
                 'price', oi.price
               )
             ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = $1 AND o.user_id = $2
      GROUP BY o.id
    `, [orderId, userId]);

    return rows[0] || null;
  }

  async createOrder(userId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { rows: cartRows } = await client.query(`
        SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.user_id = $1
      `, [userId]);

      if (!cartRows.length) {
        const error = new Error('Your cart is empty');
        error.statusCode = 400;
        throw error;
      }

      for (const item of cartRows) {
        if (item.quantity > item.stock) {
          const error = new Error(`Insufficient stock for ${item.name}`);
          error.statusCode = 400;
          throw error;
        }
      }

      const totalAmount = cartRows.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
      const { rows: orderRows } = await client.query(`
        INSERT INTO orders (user_id, total_amount, status)
        VALUES ($1, $2, 'paid')
        RETURNING id, total_amount, status, created_at
      `, [userId, Number(totalAmount.toFixed(2))]);

      const order = orderRows[0];

      for (const item of cartRows) {
        await client.query(`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4)
        `, [order.id, item.product_id, item.quantity, item.price]);

        await client.query(`
          UPDATE products
          SET stock = stock - $1
          WHERE id = $2
        `, [item.quantity, item.product_id]);
      }

      await client.query(`
        DELETE FROM cart_items
        WHERE user_id = $1
      `, [userId]);

      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new OrderService();
