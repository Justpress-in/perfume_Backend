const express = require('express');
const router = express.Router();
const c = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');
const { optionalUserAuth } = require('../middleware/userAuth');

router.get('/product/:productId', c.listByProduct);
router.post('/', optionalUserAuth, c.create);

router.get('/', authenticate, c.adminList);
router.put('/:id', authenticate, c.update);
router.patch('/:id/approve', authenticate, c.approve);
router.delete('/:id', authenticate, authorize('superadmin'), c.remove);

module.exports = router;
