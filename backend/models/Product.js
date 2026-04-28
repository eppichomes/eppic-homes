const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Automobile', 'Baby Products', 'Books, Movies and Music', 'Computing', 'Electronics', 'Fashion', 'Gaming', 'Garden & Out
  },
  price: { type: Number, required: true },
  oldPrice: { type: Number, default: null },
  description: { type: String, required: true },



  images: [{ type: String }],
  stock: { type: Number, required: true, default: 0 },
  inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  badge: { type: String, enum: ['best', 'deal', 'new', null], default: null },
  sku: { type: String, unique: true },
}, { timestamps: true });

// Auto-set inStock based on stock quantity
productSchema.pre('save', function (next) {
  this.inStock = this.stock > 0;
  next();
});

module.exports = mongoose.model('Product', productSchema);
