 const express = require('express');
const cors = require('cors');

const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Root Healthcheck Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to E-Commerce REST API',
    status: 'Running'
  });
});

module.exports = app;