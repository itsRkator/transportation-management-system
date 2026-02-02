/**
 * Shipment model - data access for shipments (MVC Model layer).
 */
const { pool } = require('../config/database');

class ShipmentModel {
  static async findAll({ filters = {}, sortBy = 'created_at', sortOrder = 'DESC', limit = 20, offset = 0 } = {}) {
    const params = [];
    const conditions = [];
    let idx = 1;

    if (filters.shipperName) {
      conditions.push(`shipper_name ILIKE $${idx}`);
      params.push(`%${filters.shipperName}%`);
      idx++;
    }
    if (filters.carrierName) {
      conditions.push(`carrier_name ILIKE $${idx}`);
      params.push(`%${filters.carrierName}%`);
      idx++;
    }
    if (filters.status) {
      conditions.push(`status = $${idx}`);
      params.push(filters.status);
      idx++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const allowedSort = ['id', 'shipper_name', 'carrier_name', 'status', 'created_at', 'pickup_location', 'delivery_location'];
    const orderBy = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    params.push(limit, offset);
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM shipments ${whereClause}`,
      params.slice(0, params.length - 2)
    );
    const total = countResult.rows[0].total;

    const { rows } = await pool.query(
      `SELECT id, shipper_name, carrier_name, pickup_location, delivery_location, tracking_data, rates, status, created_at, updated_at
       FROM shipments ${whereClause}
       ORDER BY ${orderBy} ${order}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );
    return { items: rows, total };
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, shipper_name, carrier_name, pickup_location, delivery_location, tracking_data, rates, status, created_at, updated_at
       FROM shipments WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  static async create(data) {
    const {
      shipperName,
      carrierName,
      pickupLocation,
      deliveryLocation,
      trackingData = {},
      rates = {},
      status = 'pending',
    } = data;
    const { rows } = await pool.query(
      `INSERT INTO shipments (shipper_name, carrier_name, pickup_location, delivery_location, tracking_data, rates, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, shipper_name, carrier_name, pickup_location, delivery_location, tracking_data, rates, status, created_at, updated_at`,
      [
        shipperName,
        carrierName,
        pickupLocation,
        deliveryLocation,
        JSON.stringify(trackingData),
        JSON.stringify(rates),
        status,
      ]
    );
    return rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    const map = {
      shipperName: 'shipper_name',
      carrierName: 'carrier_name',
      pickupLocation: 'pickup_location',
      deliveryLocation: 'delivery_location',
      trackingData: 'tracking_data',
      rates: 'rates',
      status: 'status',
    };
    for (const [key, col] of Object.entries(map)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = $${idx}`);
        values.push(typeof data[key] === 'object' && col !== 'status' ? JSON.stringify(data[key]) : data[key]);
        idx++;
      }
    }
    if (fields.length === 0) return ShipmentModel.findById(id);
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE shipments SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, shipper_name, carrier_name, pickup_location, delivery_location, tracking_data, rates, status, created_at, updated_at`,
      values
    );
    return rows[0] || null;
  }

  static async getStats() {
    const { rows: statusRows } = await pool.query(`
      SELECT status, COUNT(*)::int AS count FROM shipments GROUP BY status ORDER BY count DESC
    `);
    const { rows: totalRow } = await pool.query('SELECT COUNT(*)::int AS total FROM shipments');
    const { rows: freightRow } = await pool.query(`
      SELECT COALESCE(SUM((rates->>'freight')::numeric), 0) AS total_freight FROM shipments WHERE rates ? 'freight'
    `);
    const { rows: carrierRows } = await pool.query(`
      SELECT carrier_name, COUNT(*)::int AS count, COALESCE(SUM((rates->>'freight')::numeric), 0) AS total_freight
      FROM shipments GROUP BY carrier_name ORDER BY count DESC
    `);
    return {
      total: totalRow[0].total,
      byStatus: statusRows,
      totalFreight: Number(freightRow[0]?.total_freight ?? 0),
      byCarrier: carrierRows.map((r) => ({ carrierName: r.carrier_name, count: r.count, totalFreight: Number(r.total_freight ?? 0) })),
    };
  }
}

module.exports = ShipmentModel;
