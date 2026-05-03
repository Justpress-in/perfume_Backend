const express = require('express');
const router = express.Router();
const c = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', c.get);
router.put('/', authenticate, authorize('superadmin'), c.update);
router.post('/upload', authenticate, authorize('superadmin'), upload.single('image'), c.uploadAsset);

module.exports = router;
