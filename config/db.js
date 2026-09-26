const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to Neon database:', err.message);
  } else {
    console.log('Successfully connected to Neon PostgreSQL database!');
    release();
  }
});

module.exports = pool;