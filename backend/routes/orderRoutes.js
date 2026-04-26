const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const twilio = require('twilio');

const sendWhatsApp = async (to, message) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID) return;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${to}`,
    });
  } catch (err) {
    console.log('WhatsApp notification failed:', err.message);
  }
};

// POST create order (public)
router.post('/', async (req, res) => {
  try {
    const { customer, delivery, items } = req.body;

    // Validate and enrich items
    const enrichedItems = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || '',
      };
    }));

    const subtotal = enrichedItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const deliveryFee = delivery.method === 'pickup' ? 0 : (subtotal >= 2000 ? 0 : 150);
    const total = subtotal + deliveryFee;

    const order = await Order.create({
      customer,
      delivery: { ...delivery, fee: deliveryFee },
      items: enrichedItems,
      subtotal,
      total,
      payment: { method: 'mpesa', status: 'pending' },
    });

    // Deduct stock
    await Promise.all(enrichedItems.map(i =>
      Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } })
    ));

    // Notify shop owner via WhatsApp
    const itemsList = enrichedItems.map(i => `• ${i.name} ×${i.quantity}`).join('\n');
    await sendWhatsApp(process.env.SHOP_WHATSAPP_NUMBER?.replace('whatsapp:', ''),
      `🛍️ *New Order ${order.orderNumber}*\n\nCustomer: ${customer.name}\nPhone: ${customer.phone}\nArea: ${delivery.area}\n\n${itemsList}\n\n*Total: KES ${total.toLocaleString()}*\nDelivery: ${delivery.method}`
    );

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET all orders (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, date } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single order by order number (public — for tracking)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({
      orderNumber: order.orderNumber,
      status: order.status,
      customer: { name: order.customer.name },
      items: order.items,
      total: order.total,
      delivery: order.delivery,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update order status (admin)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Notify customer
    const messages = {
      confirmed: `✅ *Order ${order.orderNumber} Confirmed!*\nHi ${order.customer.name}, we've received your order and payment. We're preparing it now!`,
      dispatched: `🚚 *Order ${order.orderNumber} On the Way!*\nHi ${order.customer.name}, your order is out for delivery. Our rider will call you shortly.`,
      delivered: `🎉 *Order ${order.orderNumber} Delivered!*\nHi ${order.customer.name}, your Eppic Homes order has been delivered. Thank you for shopping with us!\n\nRate us: https://eppichomes.co.ke/review`,
    };
    if (messages[status]) {
      await sendWhatsApp(order.customer.phone, messages[status]);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET daily sales summary (admin)
router.get('/summary/today', protect, adminOnly, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } });
    const revenue = orders.filter(o => o.payment.status === 'paid').reduce((s, o) => s + o.total, 0);

    res.json({
      totalOrders: orders.length,
      revenue,
      pending: orders.filter(o => o.status === 'pending').length,
      dispatched: orders.filter(o => o.status === 'dispatched').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
