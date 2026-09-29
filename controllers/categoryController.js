const pool = require('../config/db');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY category_id ASC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Get single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }

    const result = await pool.query('SELECT * FROM categories WHERE category_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;

    if (!category_name || category_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const result = await pool.query(
      'INSERT INTO categories (category_name, description) VALUES ($1, $2) RETURNING *',
      [category_name.trim(), description || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, description } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }

    if (!category_name || category_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const result = await pool.query(
      'UPDATE categories SET category_name = $1, description = $2 WHERE category_id = $3 RETURNING *',
      [category_name.trim(), description || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }

    const result = await pool.query('DELETE FROM categories WHERE category_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};