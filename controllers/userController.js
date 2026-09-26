const pool = require('../config/db');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT user_id, full_name, email, status FROM users');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT user_id, full_name, email, status FROM users WHERE user_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required' });
    }

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, status)
       VALUES ($1, $2, $3, 'active') RETURNING user_id, full_name, email, status`,
      [full_name, email, password]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // Unique email error
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update user status (PATCH /api/users/:id/status)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE user_id = $2 RETURNING user_id, full_name, email, status',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};