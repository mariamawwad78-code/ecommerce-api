const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. Register User
exports.registerUser = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    // Input Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Hash Password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userRole = role === 'admin' ? 'admin' : 'customer';

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, 'active') 
       RETURNING user_id, full_name, email, role, status`,
      [full_name, email.toLowerCase().trim(), hashedPassword, userRole]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Register Error Detail:', error); // سيعرض السبب المباشر بالترمينات في حال وجود تعارض بالجدول
    
    if (error.code === '23505') { 
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error',
      error_detail: error.message 
    });
  }
};

// 2. Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const result = await pool.query(
      'SELECT user_id, full_name, email, password_hash, role, status FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { 
        id: user.user_id, 
        email: user.email, 
        role: user.role || 'customer' 
      },
      process.env.JWT_SECRET || 'super_secret_jwt_key_123',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login Error Detail:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 3. Get Current User Profile
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT user_id, full_name, email, role, status FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 4. Get all users (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT user_id, full_name, email, role, status FROM users');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 5. Get single user by ID (With IDOR Protection)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin' && parseInt(req.user.id) !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view another user details.'
      });
    }

    const result = await pool.query(
      'SELECT user_id, full_name, email, role, status FROM users WHERE user_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 6. Update user status (Admin Only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE user_id = $2 RETURNING user_id, full_name, email, role, status',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};