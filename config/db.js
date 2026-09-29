const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // يمنع انقطاع اتصال SSL مع Neon
  },
  connectionTimeoutMillis: 10000, // زيادة وقت انتظار الاتصال لـ 10 ثوانٍ
  idleTimeoutMillis: 30000
});

pool.on('connect', () => {
  console.log('Successfully connected to Neon PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;