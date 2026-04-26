const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST — Admin/Customer Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — Reset admin password
router.get('/reset-admin', async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    admin.password = 'Eppic2025';
    await admin.save();
    res.json({ message: 'Password reset successfully!', email: admin.email, password: 'Eppic2025' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — Seed admin account (run once in browser)
router.get('/seed-admin', async (req, res) => {
  try {
    const exists = await User.findOne({ role: 'admin' });
    if (exists) return res.status(400).json({ message: 'Admin already exists', email: exists.email });
    const admin = await User.create({
      name: 'Eppic Admin',
      email: process.env.ADMIN_EMAIL || 'godfreywarigia@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'EppicAdmin2025!',
      role: 'admin',
    });
    res.status(201).json({ message: 'Admin created successfully!', email: admin.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST — Seed admin account (run once)
router.post('/seed-admin', async (req, res) => {
  try {
    const exists = await User.findOne({ role: 'admin' });
    if (exists) return res.status(400).json({ message: 'Admin already exists' });

    const admin = await User.create({
      name: 'Eppic Admin',
      email: process.env.ADMIN_EMAIL || 'admin@eppichomes.co.ke',
      password: process.env.ADMIN_PASSWORD || 'Admin@2025',
      role: 'admin',
    });

    res.status(201).json({ message: 'Admin created', email: admin.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
