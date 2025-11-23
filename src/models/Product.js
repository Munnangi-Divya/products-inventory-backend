

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  unit: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  status: { type: String, required: true, enum: ['In Stock', 'Out of Stock'] },
  image: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);

