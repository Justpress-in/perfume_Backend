const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct,
  updateProduct, patchProduct, deleteProduct, uploadImage,
} = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected — editor+
router.post('/', authenticate, createProduct);
router.put('/:id', authenticate, updateProduct);
router.patch('/:id', authenticate, patchProduct);
router.post('/:id/image', authenticate, upload.single('image'), uploadImage);

// Protected — superadmin only
router.delete('/:id', authenticate, authorize('superadmin'), deleteProduct);

module.exports = router;
