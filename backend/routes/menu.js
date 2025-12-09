const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { authMiddleware } = require('../middleware/auth');

// GET menu
router.get('/:slug/menu', async (req,res) => {
  const { slug } = req.params;
  const rest = await Restaurant.findOne({ slug });
  if (!rest) return res.status(404).json([]);
  const items = await MenuItem.find({ restaurantId: rest._id }).lean();
  res.json(items);
});

// Protected: create
router.post('/:slug/menu', authMiddleware('admin'), async (req,res) => {
  const { slug } = req.params;
  const rest = await Restaurant.findOne({ slug });
  if (!rest) return res.status(404).json({ error: 'Restaurant not found' });
  const payload = { ...req.body, restaurantId: rest._id };
  const item = await MenuItem.create(payload);
  res.json(item);
});

// other endpoints: put/delete etc. (omitted for brevity)
module.exports = router;