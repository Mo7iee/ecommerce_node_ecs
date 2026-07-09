const express = require('express');
const authService = require('../services/authService');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const token = await authService.login({ email, password });
    res.json({ token });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router;
