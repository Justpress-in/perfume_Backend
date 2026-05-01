const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct,
  updateProduct, patchProduct, deleteProduct,
  uploadImage, uploadImages, deleteImage,
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

// Single primary image (backwards-compat)
router.post('/:id/image', authenticate, upload.single('image'), uploadImage);

// Multi-image: add up to 10 at once
router.post('/:id/images', authenticate, upload.array('images', 10), uploadImages);

// Remove one image by index
router.delete('/:id/images/:index', authenticate, deleteImage);

// Protected — superadmin only
router.delete('/:id', authenticate, authorize('superadmin'), deleteProduct);

module.exports = router;
