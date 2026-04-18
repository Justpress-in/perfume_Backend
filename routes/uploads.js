const express = require('express');
const router = express.Router();
const c = require('../controllers/uploadController');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');

router.post('/image', authenticate, upload.single('image'), c.uploadImage);
router.post('/images', authenticate, upload.array('images', 10), c.uploadMultiple);

module.exports = router;
