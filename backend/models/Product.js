const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Automobile', 'Baby Products', 'Computing', 'Electronics', 'Fashion', 'Gaming', 'Grocery', 'Health and Beauty', 'Home and Office', 'Livestock', 'Miscellaneous', 'Musical Instruments', 'Pet Supplies', 'Phones and Tablets', 'Services', 'Sporting Goods', 'Toys and Games', 'Wholesale']
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
productSchema.pre('save', function (next) {
  this.inStock = this.stock > 0;
  next();
});
module.exports = mongoose.model('Product', productSchema);