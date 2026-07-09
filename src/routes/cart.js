const express = require('express');
const auth = require('../middleware/auth');
const cartService = require('../services/cartService');

const router = express.Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const items = await cartService.getCartItems(req.user.id);
    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    res.json({
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: Number(subtotal.toFixed(2)),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/items', auth, async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({ error: 'productId and a positive quantity are required' });
    }

    const item = await cartService.addItem(req.user.id, Number(productId), Number(quantity));
    res.status(201).json(item);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    next(error);
  }
});

router.put('/items/:productId', auth, async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'A valid productId and positive quantity are required' });
    }

    await cartService.updateItem(req.user.id, productId, quantity);
    res.json({ message: 'Cart updated' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    next(error);
  }
});

router.delete('/items/:productId', auth, async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    await cartService.removeItem(req.user.id, productId);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router;
