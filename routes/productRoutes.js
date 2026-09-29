const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public Read Routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin-Only Routes for Modifications
router.post('/', authenticateToken, authorizeRoles('admin'), productController.createProduct);
router.put('/:id', authenticateToken, authorizeRoles('admin'), productController.updateProduct);
router.patch('/:id/deactivate', authenticateToken, authorizeRoles('admin'), productController.deactivateProduct);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), productController.deleteProduct);

module.exports = router;