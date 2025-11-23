
const mongoose = require('mongoose');

async function connect(uri) {
  try {
    await mongoose.connect(uri, { dbName: 'product_inventory' });
    console.log('MongoDB Connected');
  } catch (err) {
    console.log('MongoDB Connection Failed');
    process.exit(1);
  }
}

module.exports = { connect };

