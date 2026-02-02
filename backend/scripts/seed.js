/**
 * Seeds users and sample shipments.
 */
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const SALT_ROUNDS = 10;

async function seed() {
  const client = await pool.connect();
  try {
    const adminHash = await bcrypt.hash('admin123', SALT_ROUNDS);
    const empHash = await bcrypt.hash('employee123', SALT_ROUNDS);

    await client.query(
      `INSERT INTO users (email, password_hash, role) VALUES
        ('admin@tms.com', $1, 'admin'),
        ('employee@tms.com', $2, 'employee')
      ON CONFLICT (email) DO NOTHING;`,
      [adminHash, empHash]
    );

    const { rowCount } = await client.query('SELECT 1 FROM shipments LIMIT 1');
    if (rowCount === 0) {
      await client.query(`
        INSERT INTO shipments (shipper_name, carrier_name, pickup_location, delivery_location, tracking_data, rates, status) VALUES
          ('Acme Logistics', 'FedEx Freight', '123 Warehouse St, Chicago, IL', '456 Distribution Ave, Dallas, TX', '{"trackingNumber":"FX123456","lastScan":"Chicago Hub"}', '{"freight":450,"fuelSurcharge":45}', 'in_transit'),
          ('Global Supplies Inc', 'UPS Freight', '789 Industrial Blvd, Detroit, MI', '321 Commerce Dr, Atlanta, GA', '{"trackingNumber":"UPS789012","lastScan":"Louisville"}', '{"freight":620,"fuelSurcharge":62}', 'in_transit'),
          ('Pacific Imports', 'XPO Logistics', '555 Port Rd, Los Angeles, CA', '777 Trade Center, Seattle, WA', '{"trackingNumber":"XPO555777","lastScan":"LA Depot"}', '{"freight":380,"fuelSurcharge":38}', 'pending'),
          ('Midwest Manufacturing', 'Old Dominion', '100 Factory Lane, Cleveland, OH', '200 Retail Park, Denver, CO', '{"trackingNumber":"OD200100","lastScan":"Cleveland"}', '{"freight":520,"fuelSurcharge":52}', 'delivered'),
          ('Eastern Traders', 'J.B. Hunt', '400 Harbor Way, Boston, MA', '600 Logistics Blvd, Phoenix, AZ', '{"trackingNumber":"JB400600","lastScan":"Phoenix"}', '{"freight":890,"fuelSurcharge":89}', 'in_transit')
      `);
    }
    console.log('Seed completed. Users: admin@tms.com / admin123 (admin), employee@tms.com / employee123 (employee).');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
