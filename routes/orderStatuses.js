const express = require('express');
const router = express.Router();
const c = require('../controllers/orderStatusController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', c.list);                                          // Public / admin: list
router.post('/', authenticate, authorize('superadmin'), c.create);
router.put('/:id', authenticate, authorize('superadmin'), c.update);
router.delete('/:id', authenticate, authorize('superadmin'), c.remove);

module.exports = router;
