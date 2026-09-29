const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// 1. Auth Routes (Public) - يجب وضعها في البداية
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// 2. Protected Routes (Logged In)
router.get('/me', authenticateToken, userController.getCurrentUser);

// 3. Admin-Only Routes
router.get('/', authenticateToken, authorizeRoles('admin'), userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUserById);
router.patch('/:id/status', authenticateToken, authorizeRoles('admin'), userController.updateUserStatus);

module.exports = router;