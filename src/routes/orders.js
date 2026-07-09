const express = require('express');
const auth = require('../middleware/auth');
const orderService = require('../services/orderService');

const router = express.Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const orders = await orderService.getOrders(req.user.id);
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.user.id, req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user.id);
    res.status(201).json(order);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router;
