const express = require('express');
const router = express.Router();
const c = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('superadmin'));

router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', c.create);
router.put('/:id', c.update);
router.put('/:id/password', c.resetPassword);
router.delete('/:id', c.remove);

module.exports = router;
