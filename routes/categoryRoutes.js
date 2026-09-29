const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public Read Routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin-Only Routes for Modifications
router.post('/', authenticateToken, authorizeRoles('admin'), categoryController.createCategory);
router.put('/:id', authenticateToken, authorizeRoles('admin'), categoryController.updateCategory);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), categoryController.deleteCategory);

module.exports = router;