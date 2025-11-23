require('dotenv').config();
const app = require('./app');
const { connect } = require('./config/db');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 5000;
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/product_inventory')
  .then(() => {
    app.listen(port, () => {});
  })
  .catch(() => { process.exit(1); });
