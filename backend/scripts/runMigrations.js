/**
 * Runs SQL migrations for Shipment and User tables.
 */
const { pool } = require('../config/database');

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS shipments (
        id SERIAL PRIMARY KEY,
        shipper_name VARCHAR(255) NOT NULL,
        carrier_name VARCHAR(255) NOT NULL,
        pickup_location VARCHAR(500) NOT NULL,
        delivery_location VARCHAR(500) NOT NULL,
        tracking_data JSONB DEFAULT '{}',
        rates JSONB DEFAULT '{}',
        status VARCHAR(100) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_shipments_shipper ON shipments(shipper_name);
      CREATE INDEX IF NOT EXISTS idx_shipments_carrier ON shipments(carrier_name);
      CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
      CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON shipments(created_at DESC);
    `);
    console.log('Migrations completed.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
