const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { importCSV, exportCSV, listProducts, getProduct, updateProduct, deleteProduct, getHistory } = require('../controllers/productsController');
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: function(req, file, cb) { cb(null, uploadDir); },
  filename: function(req, file, cb) { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage });
router.post('/import', upload.single('file'), importCSV);
router.get('/export', exportCSV);
router.get('/', listProducts);
router.get('/search', listProducts);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/:id/history', getHistory);
module.exports = router;
