/**
 * Seeds users and sample shipments.
 */
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const SALT_ROUNDS = 10;

const SHIPPERS = [
  'Acme Logistics',
  'Global Supplies Inc',
  'Pacific Imports',
  'Midwest Manufacturing',
  'Eastern Traders',
  'Northern Freight Co',
  'Southern Distribution',
  'Central Carriers',
  'Coastal Shipping',
  'Inland Express',
  'Metro Logistics',
  'Rural Transport',
  'Cross-State Freight',
  'QuickShip Inc',
  'Bulk Haulers LLC',
  'Premium Cargo',
  'Standard Freight Co',
  'Elite Logistics',
  'Swift Transport',
  'Reliable Movers',
];

const CARRIERS = [
  'FedEx Freight',
  'UPS Freight',
  'XPO Logistics',
  'Old Dominion',
  'J.B. Hunt',
  'Werner Enterprises',
  'Schneider National',
  'Knight-Swift',
  'Landstar',
  'Estes Express',
  'R+L Carriers',
  'Saia LTL',
  'ABF Freight',
  'Yellow Freight',
  'Con-way Freight',
];

const CITIES = [
  ['Chicago', 'IL'],
  ['Dallas', 'TX'],
  ['Detroit', 'MI'],
  ['Atlanta', 'GA'],
  ['Los Angeles', 'CA'],
  ['Seattle', 'WA'],
  ['Cleveland', 'OH'],
  ['Denver', 'CO'],
  ['Boston', 'MA'],
  ['Phoenix', 'AZ'],
  ['Houston', 'TX'],
  ['Miami', 'FL'],
  ['Minneapolis', 'MN'],
  ['Philadelphia', 'PA'],
  ['San Diego', 'CA'],
  ['Portland', 'OR'],
  ['Las Vegas', 'NV'],
  ['Charlotte', 'NC'],
  ['Indianapolis', 'IN'],
  ['Columbus', 'OH'],
];

const STATUSES = ['pending', 'in_transit', 'delivered'];
const HUBS = [
  'Chicago Hub',
  'Louisville',
  'LA Depot',
  'Phoenix',
  'Dallas Hub',
  'Atlanta DC',
  'Denver Terminal',
  'Seattle Depot',
  'Detroit Yard',
  'Boston Port',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildShipments(count) {
  const rows = [];
  const params = [];
  let idx = 1;
  for (let i = 0; i < count; i++) {
    const [pickCity, pickState] = pick(CITIES);
    const [delCity, delState] = pick(CITIES);
    const freight = randomInt(250, 1200);
    const fuelSurcharge = Math.round(freight * 0.1);
    const trackingNumber = `${pick([
      'FX',
      'UPS',
      'XPO',
      'OD',
      'JB',
    ])}${randomInt(100000, 999999)}`;
    const trackingData = JSON.stringify({
      trackingNumber,
      lastScan: pick(HUBS),
    });
    const rates = JSON.stringify({ freight, fuelSurcharge });
    const status = pick(STATUSES);
    rows.push(
      `($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}::jsonb, $${
        idx + 5
      }::jsonb, $${idx + 6})`
    );
    params.push(
      pick(SHIPPERS),
      pick(CARRIERS),
      `${randomInt(100, 999)} ${pick([
        'Warehouse St',
        'Industrial Blvd',
        'Port Rd',
        'Factory Lane',
        'Harbor Way',
      ])}, ${pickCity}, ${pickState}`,
      `${randomInt(100, 999)} ${pick([
        'Distribution Ave',
        'Commerce Dr',
        'Trade Center',
        'Retail Park',
        'Logistics Blvd',
      ])}, ${delCity}, ${delState}`,
      trackingData,
      rates,
      status
    );
    idx += 7;
  }
  return {
    sql: `INSERT INTO shipments (shipper_name, carrier_name, pickup_location, delivery_location, tracking_data, rates, status) VALUES ${rows.join(
      ', '
    )}`,
    params,
  };
}

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
      const { sql, params } = buildShipments(100);
      await client.query(sql, params);
      console.log('Seed completed. 100 shipments inserted.');
    }
    console.log(
      'Seed completed. Users: admin@tms.com / admin123 (admin), employee@tms.com / employee123 (employee).'
    );
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
