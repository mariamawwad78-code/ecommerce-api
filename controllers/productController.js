const pool = require('../config/db');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY product_id ASC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const result = await pool.query('SELECT * FROM products WHERE product_id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const { product_name, description, price, stock_quantity, sku, category_id } = req.body;

    // 1. Validation for missing required fields
    if (!product_name || price === undefined || stock_quantity === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product name, price, and stock quantity are required' 
      });
    }

    // 2. Validation for negative price or stock
    if (price < 0 || stock_quantity < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price and stock quantity cannot be negative' 
      });
    }

    const result = await pool.query(
      `INSERT INTO products (product_name, description, price, stock_quantity, sku, category_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *`,
      [product_name.trim(), description || null, price, stock_quantity, sku || null, category_id || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    // Unique SKU constraint error
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'SKU already exists' });
    }
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, description, price, stock_quantity, sku, category_id } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    // Validation for negative values
    if ((price !== undefined && price < 0) || (stock_quantity !== undefined && stock_quantity < 0)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price and stock quantity cannot be negative' 
      });
    }

    const result = await pool.query(
      `UPDATE products 
       SET product_name = $1, description = $2, price = $3, stock_quantity = $4, sku = $5, category_id = $6
       WHERE product_id = $7 RETURNING *`,
      [product_name, description, price, stock_quantity, sku, category_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Deactivate product (Admin Only)
exports.deactivateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const result = await pool.query(
      'UPDATE products SET is_active = false WHERE product_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Product deactivated successfully', 
      data: result.rows[0] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Delete product (Admin Only)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const result = await pool.query('DELETE FROM products WHERE product_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};