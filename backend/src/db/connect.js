import pg from 'pg';
const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  host:
    process.env.POSTGRES_HOST ||
    process.env.PGHOST ||
    'localhost',
  port: Number(process.env.POSTGRES_PORT || process.env.PGPORT || 5432),
  database: process.env.POSTGRES_DB || process.env.PGDATABASE || 'roadrater',
  user: process.env.POSTGRES_USER || process.env.PGUSER || 'roadrater_user',
  password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD,

  // 🔑 This is the important part for Render:
  ssl: isProduction
    ? { rejectUnauthorized: false } // allow Render's self-signed cert
    : false,                        // no SSL for local dev
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Helper query function with error handling
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
export const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    const statement = text.split('\n')[0].trim().split(' ')[0];
    console.log('Executed query', { statement, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export { pool };
export default pool;
