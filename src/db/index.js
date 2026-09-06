const { Pool } = require('pg');

const useSSL = process.env.DB_SSL === 'true';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

module.exports = {
  pool,
};
