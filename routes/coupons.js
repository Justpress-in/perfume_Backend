const express = require('express');
const router = express.Router();
const c = require('../controllers/couponController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/validate', c.validate);

router.get('/', authenticate, c.list);
router.get('/:id', authenticate, c.getOne);
router.post('/', authenticate, c.create);
router.put('/:id', authenticate, c.update);
router.delete('/:id', authenticate, authorize('superadmin'), c.remove);

module.exports = router;
