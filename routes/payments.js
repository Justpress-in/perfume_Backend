const express = require('express');
const router = express.Router();
const c = require('../controllers/paymentController');

router.get('/paypal/config', c.getConfig);
router.post('/paypal/create-order', c.createOrder);
router.post('/paypal/capture', c.captureOrder);
router.post('/paypal/webhook', c.webhook);

module.exports = router;
