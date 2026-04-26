const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
  image: String,
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
  },
  delivery: {
    method: { type: String, enum: ['boda', 'pickup'], default: 'boda' },
    area: { type: String, default: '' },
    address: { type: String, default: '' },
    instructions: { type: String, default: '' },
    fee: { type: Number, default: 150 },
  },
  items: [orderItemSchema],
  payment: {
    method: { type: String, enum: ['mpesa'], default: 'mpesa' },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    mpesaCode: { type: String, default: '' },
    mpesaReceiptNumber: { type: String, default: '' },
    paidAt: { type: Date },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  whatsappSent: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-generate order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `EHC-${String(count + 1001).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
