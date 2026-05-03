const express = require('express');
const router = express.Router();
const c = require('../controllers/offerController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', authenticate, c.create);
router.put('/:id', authenticate, c.update);
router.delete('/:id', authenticate, authorize('superadmin'), c.remove);
router.post('/:id/image', authenticate, upload.single('image'), c.uploadImage);

module.exports = router;
