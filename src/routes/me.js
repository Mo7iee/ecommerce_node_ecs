const express = require('express');
const auth = require('../middleware/auth');
const userService = require('../services/userService');

const router = express.Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const { id } = req.user;

    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
