const express = require('express');
const router = express.Router();
const c = require('../controllers/bannerController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', authenticate, c.create);
router.put('/:id', authenticate, c.update);
router.delete('/:id', authenticate, authorize('superadmin'), c.remove);

module.exports = router;
