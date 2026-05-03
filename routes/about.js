const express = require('express');
const router = express.Router();
const c = require('../controllers/aboutController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', c.get);
router.put('/', authenticate, c.update);
router.post('/sections', authenticate, c.addSection);
router.put('/sections/:sectionId', authenticate, c.updateSection);
router.delete('/sections/:sectionId', authenticate, c.removeSection);
router.post('/sections/:sectionId/image', authenticate, upload.single('image'), c.uploadSectionImage);

module.exports = router;
