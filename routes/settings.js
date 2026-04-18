const express = require('express');
const router = express.Router();
const c = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', c.get);
router.put('/', authenticate, authorize('superadmin'), c.update);

module.exports = router;
