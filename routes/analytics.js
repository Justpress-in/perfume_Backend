const express = require('express');
const router = express.Router();
const { getSummary, getTopProducts, getOrderTimeline, getChannelBreakdown } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.get('/summary',          authenticate, getSummary);
router.get('/products',         authenticate, getTopProducts);
router.get('/orders/timeline',  authenticate, getOrderTimeline);
router.get('/channels',         authenticate, getChannelBreakdown);

module.exports = router;
