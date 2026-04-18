const express = require('express');
const router = express.Router();
const {
  getPosts, getPost, createPost, updatePost, togglePublish, deletePost,
} = require('../controllers/blogController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public (frontend journal)
router.get('/', getPosts);
router.get('/:id', getPost);

// Protected
router.post('/', authenticate, createPost);
router.put('/:id', authenticate, updatePost);
router.patch('/:id/publish', authenticate, togglePublish);
router.delete('/:id', authenticate, authorize('superadmin'), deletePost);

module.exports = router;
