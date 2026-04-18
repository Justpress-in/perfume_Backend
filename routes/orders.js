const express = require('express');
const router = express.Router();
const { getOrders, getOrder, createOrder, updateStatus, exportOrders } = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', createOrder);                                    // Public (frontend checkout)
router.get('/', authenticate, getOrders);                         // Admin: list
router.get('/export', authenticate, authorize('superadmin'), exportOrders); // Admin: CSV
router.get('/:id', authenticate, getOrder);                       // Admin: detail
router.patch('/:id/status', authenticate, updateStatus);          // Admin: update status

module.exports = router;
