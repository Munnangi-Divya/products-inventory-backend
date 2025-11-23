const mongoose = require('mongoose');

const InventoryLogSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  oldStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  changedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InventoryLog', InventoryLogSchema);
