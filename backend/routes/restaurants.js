const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');

router.get('/:slug', async (req,res) => {
  const { slug } = req.params;
  const r = await Restaurant.findOne({ slug }).lean();
  if (!r) return res.status(404).json({ error: 'Restaurant not found' });
  res.json(r);
});

module.exports = router;
