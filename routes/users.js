const express = require('express');
const router = express.Router();
const c = require('../controllers/userController');
const { authenticateUser } = require('../middleware/userAuth');
const { authenticate: adminAuth, authorize } = require('../middleware/auth');

// Public
router.post('/register', c.register);
router.post('/login', c.login);
router.post('/refresh', c.refresh);

// Authenticated user
router.post('/logout', authenticateUser, c.logout);
router.get('/me', authenticateUser, c.getMe);
router.put('/me', authenticateUser, c.updateMe);
router.put('/me/password', authenticateUser, c.changePassword);

router.get('/me/addresses', authenticateUser, c.listAddresses);
router.post('/me/addresses', authenticateUser, c.addAddress);
router.put('/me/addresses/:addrId', authenticateUser, c.updateAddress);
router.delete('/me/addresses/:addrId', authenticateUser, c.deleteAddress);

router.get('/me/wishlist', authenticateUser, c.getWishlist);
router.post('/me/wishlist', authenticateUser, c.toggleWishlist);
router.delete('/me/wishlist/:productId', authenticateUser, c.removeWishlist);

router.get('/me/orders', authenticateUser, c.myOrders);

// Admin
router.get('/', adminAuth, c.adminListUsers);
router.get('/:id', adminAuth, c.adminGetUser);
router.put('/:id', adminAuth, c.adminUpdateUser);
router.delete('/:id', adminAuth, authorize('superadmin'), c.adminDeleteUser);

module.exports = router;
