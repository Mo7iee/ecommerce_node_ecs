const express = require('express');
const auth = require('../middleware/auth');
const productService = require('../services/productService');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const products = await productService.listProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await productService.getProductById(Number(req.params.id));

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const { name, description, price, stock } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'name and price are required' });
    }

    const product = await productService.createProduct({ name, description, price, stock });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
