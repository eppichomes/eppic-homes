const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/cloudinaryConfig');

// GET all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, featured, search } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (featured) filter.featured = true;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create product (admin only)
router.post('/', protect, adminOnly, upload.array('images', 4), async (req, res) => {
  try {
    const { name, category, price, oldPrice, description, stock, featured, badge } = req.body;
    const images = req.files ? req.files.map(f => f.path) : [];
    const sku = `EHC-${Date.now()}`;

    const product = await Product.create({
      name, category, price, oldPrice, description,
      stock, featured, badge, images, sku
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update product (admin only)
router.put('/:id', protect, adminOnly, upload.array('images', 4), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const fields = ['name', 'category', 'price', 'oldPrice', 'description', 'stock', 'featured', 'badge'];
    fields.forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f]; });
    if (req.files && req.files.length > 0) {
      product.images = req.files.map(f => f.path);
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE product (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
