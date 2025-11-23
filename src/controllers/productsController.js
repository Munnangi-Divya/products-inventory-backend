const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const { parseCSVFile, createCSVBuffer } = require('../utils/csv');
const fs = require('fs');
const path = require('path');

async function importCSV(req, res) {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file' });
  const rows = await parseCSVFile(file.path);
  const added = [];
  const skipped = [];
  const duplicates = [];
  for (const r of rows) {
    const name = (r.name || '').trim();
    if (!name) {
      skipped.push(r);
      continue;
    }
    const existing = await Product.findOne({ name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' } });
    if (existing) {
      duplicates.push({ name, existingId: existing._id });
      continue;
    }
    const stock = Number(r.stock || 0);
    const status = stock > 0 ? 'In Stock' : 'Out of Stock';
    const p = new Product({
      name,
      unit: r.unit || 'pcs',
      category: r.category || 'general',
      brand: r.brand || 'unknown',
      stock: stock < 0 ? 0 : stock,
      status,
      image: r.image || ''
    });
    await p.save();
    added.push(p);
  }
  fs.unlinkSync(file.path);
  return res.json({ added: added.length, skipped: skipped.length, duplicates });
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function exportCSV(req, res) {
  const products = await Product.find({}).lean();
  if (!products.length) return res.status(204).send();
  const buffer = createCSVBuffer(products.map(p => ({
    name: p.name,
    unit: p.unit,
    category: p.category,
    brand: p.brand,
    stock: p.stock,
    status: p.status,
    image: p.image || ''
  })));
  res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
  res.setHeader('Content-Type', 'text/csv');
  res.send(buffer);
}

async function listProducts(req, res) {
  const q = req.query.q || req.query.name || '';
  const category = req.query.category;
  const filter = {};
  if (q) filter.name = { $regex: q, $options: 'i' };
  if (category) filter.category = category;
  const products = await Product.find(filter).collation({ locale: 'en', strength: 2 }).lean();
  return res.json(products);
}

async function getProduct(req, res) {
  const p = await Product.findById(req.params.id).lean();
  if (!p) return res.status(404).json({ error: 'Not found' });
  return res.json(p);
}

async function updateProduct(req, res) {
  const id = req.params.id;
  const body = req.body;
  if (body.stock != null) {
    const stockNum = Number(body.stock);
    if (isNaN(stockNum) || stockNum < 0) return res.status(400).json({ error: 'Invalid stock' });
  }
  const existing = await Product.findOne({ name: body.name, _id: { $ne: id } }).collation({ locale: 'en', strength: 2 });
  if (existing) return res.status(400).json({ error: 'Name must be unique' });
  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  const oldStock = product.stock;
  product.name = body.name || product.name;
  product.unit = body.unit || product.unit;
  product.category = body.category || product.category;
  product.brand = body.brand || product.brand;
  if (body.stock != null) product.stock = Number(body.stock);
  product.status = product.stock > 0 ? 'In Stock' : 'Out of Stock';
  product.image = body.image || product.image;
  await product.save();
  if (oldStock !== product.stock) {
    const log = new InventoryLog({
      productId: product._id,
      oldStock,
      newStock: product.stock,
      changedBy: body.changedBy || 'admin'
    });
    await log.save();
  }
  return res.json(product);
}

async function deleteProduct(req, res) {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  return res.json({ deleted: true });
}

async function getHistory(req, res) {
  const pid = req.params.id;
  const logs = await InventoryLog.find({ productId: pid }).sort({ timestamp: -1 }).lean();
  return res.json(logs);
}

module.exports = {
  importCSV,
  exportCSV,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getHistory
};
