const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const { authMiddleware } = require('../middleware/auth');

// create order
router.post('/:slug/orders', async (req,res) => {
  const { slug } = req.params;
  const rest = await Restaurant.findOne({ slug });
  if (!rest) return res.status(404).json({ error: 'Restaurant not found' });
  const payload = { ...req.body, restaurantId: rest._id };
  const order = await Order.create(payload);
  // emit via socket
  req.app.get('io')?.to(`restaurant:${rest._id.toString()}`).emit('order:created', order);
  res.json({ orderId: order._id });
});

// get order
router.get('/:slug/orders/:orderId', async (req,res) => {
  const { slug, orderId } = req.params;
  const rest = await Restaurant.findOne({ slug });
  if (!rest) return res.status(404).json({ error: 'Restaurant not found' });
  const order = await Order.findOne({ _id: orderId, restaurantId: rest._id }).lean();
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// update status (admin)
router.put('/:slug/orders/:orderId/status', authMiddleware('admin'), async (req,res) => {
  const { slug, orderId } = req.params;
  const { status, completionTime } = req.body;
  const rest = await Restaurant.findOne({ slug });
  if (!rest) return res.status(404).json({ error: 'Restaurant not found' });
  const order = await Order.findOne({ _id: orderId, restaurantId: rest._id });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = status;
  if (status === 'approved') {
    order.startTime = new Date();
    if (completionTime) order.completionTime = completionTime;
  }
  await order.save();
  req.app.get('io')?.to(`restaurant:${rest._id.toString()}`).emit('order:updated', order);
  res.json({ ok: true });
});



// Add this to backend/routes/orders.js (above module.exports)
router.get('/:slug/orders', async (req, res) => {
    try {
      const { slug } = req.params;
      const { table, limit = 50, date } = req.query;
      const rest = await Restaurant.findOne({ slug });
      if (!rest) return res.status(404).json({ error: 'Restaurant not found' });
  
      const q = { restaurantId: rest._id };
      if (table) q.tableId = table;
      if (date) {
        // filter by date (YYYY-MM-DD) on createdAt
        const start = new Date(date);
        start.setHours(0,0,0,0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        q.createdAt = { $gte: start, $lt: end };
      }
  
      const orders = await Order.find(q).sort({ createdAt: -1 }).limit(Number(limit)).lean();
      res.json(orders);
    } catch (err) {
      console.error('List orders error', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

module.exports = router;
