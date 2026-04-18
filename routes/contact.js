const express = require('express');
const router = express.Router();
const c = require('../controllers/contactController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', c.create);

router.get('/', authenticate, c.list);
router.get('/:id', authenticate, c.getOne);
router.put('/:id', authenticate, c.update);
router.delete('/:id', authenticate, authorize('superadmin'), c.remove);

module.exports = router;
