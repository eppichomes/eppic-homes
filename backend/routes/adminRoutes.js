const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET dashboard overview stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);

    const [todayOrders, monthOrders, totalProducts, lowStock] = await Promise.all([
      Order.find({ createdAt: { $gte: today } }),
      Order.find({ createdAt: { $gte: thisMonth }, 'payment.status': 'paid' }),
      Product.countDocuments(),
      Product.find({ stock: { $lte: 5 }, inStock: true }),
    ]);

    const todayRevenue = todayOrders
      .filter(o => o.payment.status === 'paid')
      .reduce((s, o) => s + o.total, 0);

    const monthRevenue = monthOrders.reduce((s, o) => s + o.total, 0);

    res.json({
      today: {
        orders: todayOrders.length,
        revenue: todayRevenue,
        pending: todayOrders.filter(o => o.status === 'pending').length,
        dispatched: todayOrders.filter(o => o.status === 'dispatched').length,
      },
      month: {
        orders: monthOrders.length,
        revenue: monthRevenue,
      },
      inventory: {
        totalProducts,
        lowStock: lowStock.map(p => ({ name: p.name, stock: p.stock, id: p._id })),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
