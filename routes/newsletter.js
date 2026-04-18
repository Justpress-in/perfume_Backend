const express = require('express');
const router = express.Router();
const c = require('../controllers/newsletterController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/subscribe', c.subscribe);
router.post('/unsubscribe', c.unsubscribe);

router.get('/', authenticate, c.list);
router.get('/export', authenticate, authorize('superadmin'), c.exportCsv);
router.delete('/:id', authenticate, authorize('superadmin'), c.remove);

module.exports = router;
