const router  = require('express').Router();
const Order   = require('../models/Order');
const logger  = require('../utils/logger');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/orders — place an order (public, works for guests too)
router.post('/', async (req, res) => {
  try {
    const { email, phone, address, city, pincode, items, total, paymentId } = req.body;
    if (!email || !address || !city || !pincode || !items?.length || !total) {
      return res.status(400).json({ error: 'Missing required order fields.' });
    }
    let userId = null, username = 'Guest';
    if (req.headers.authorization) {
      try {
        const jwt     = require('jsonwebtoken');
        const token   = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        const User = require('../models/User');
        const user = await User.findById(userId).select('username');
        if (user) username = user.username;
      } catch(e) {}
    }
    const order = await Order.create({ userId, username, email, phone, address, city, pincode, items, total, paymentId: paymentId || '' });
    logger.info(`Order placed: ${order._id} by ${username} (${email}) — ₹${total}`);
    res.status(201).json({ message: 'Order placed successfully!', orderId: order._id });
  } catch (err) {
    logger.error(`Order create error: ${err.message}`);
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

// GET /api/orders/stats — MUST be before /:id
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const [total, pending, confirmed, shipped, delivered, cancelled, rev] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }])
    ]);
    res.json({ total, pending, confirmed, shipped, delivered, cancelled, revenue: rev[0]?.total || 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/orders/my — MUST be before /:id
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ placedAt: -1 }).limit(20);
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/orders — admin: all orders
router.get('/', adminOnly, async (req, res) => {
  try {
    const limit  = Math.min(100, parseInt(req.query.limit) || 50);
    const status = req.query.status;
    const query  = status ? { status } : {};
    const orders = await Order.find(query).sort({ placedAt: -1 }).limit(limit);
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/orders/:id/status — admin: update status
router.patch('/:id/status', adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending','confirmed','shipped','delivered','cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    logger.info(`Order ${order._id} → ${status}`);
    res.json({ message: `Order updated to ${status}.`, order });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;