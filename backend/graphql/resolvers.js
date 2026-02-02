/**
 * GraphQL resolvers (MVC - controller layer).
 */
const ShipmentModel = require('../models/Shipment');
const UserModel = require('../models/User');
const { GraphQLScalarType, Kind } = require('graphql');

const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  serialize: (v) => (v ? new Date(v).toISOString() : null),
  parseValue: (v) => (v ? new Date(v) : null),
  parseLiteral: (ast) => (ast.kind === Kind.STRING ? new Date(ast.value) : null),
});

const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  serialize: (v) => v,
  parseValue: (v) => v,
  parseLiteral: () => null,
});

function mapShipment(row) {
  return {
    id: String(row.id),
    shipperName: row.shipper_name,
    carrierName: row.carrier_name,
    pickupLocation: row.pickup_location,
    deliveryLocation: row.delivery_location,
    trackingData: row.tracking_data,
    rates: row.rates,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const resolvers = {
  DateTime,
  JSON: JSONScalar,

  User: {
    createdAt: (user) => user?.created_at ?? null,
  },

  Query: {
    me: async (_, __, context) => {
      if (!context.user) return null;
      return UserModel.findById(context.user.id);
    },

    shipment: async (_, { id }, context) => {
      if (!context.user) throw new Error('Unauthorized');
      const row = await ShipmentModel.findById(Number.parseInt(id, 10));
      if (!row) return null;
      return mapShipment(row);
    },

    shipments: async (_, args, context) => {
      if (!context.user) throw new Error('Unauthorized');
      const { filters = {}, sortBy = 'created_at', sortOrder = 'DESC', limit = 20, offset = 0 } = args;
      const safeLimit = Math.min(Math.max(1, limit || 20), 100);
      const safeOffset = Math.max(0, offset || 0);
      const filterObj = {
        shipperName: filters.shipperName,
        carrierName: filters.carrierName,
        status: filters.status,
      };
      const { items, total } = await ShipmentModel.findAll({
        filters: filterObj,
        sortBy,
        sortOrder,
        limit: safeLimit,
        offset: safeOffset,
      });
      return {
        items: items.map(mapShipment),
        total,
        pageInfo: {
          hasNextPage: safeOffset + items.length < total,
          hasPreviousPage: safeOffset > 0,
          total,
          limit: safeLimit,
          offset: safeOffset,
        },
      };
    },

    shipmentStats: async (_, __, context) => {
      if (!context.user) throw new Error('Unauthorized');
      return ShipmentModel.getStats();
    },
  },

  Mutation: {
    login: async (_, { email, password }, context) => {
      const user = await UserModel.findByEmail(email);
      if (!user) throw new Error('Invalid email or password');
      const valid = await UserModel.verifyPassword(password, user.password_hash);
      if (!valid) throw new Error('Invalid email or password');
      const { issueToken } = context;
      return {
        token: issueToken({ id: user.id, role: user.role }),
        user: { id: String(user.id), email: user.email, role: user.role, createdAt: user.created_at },
      };
    },

    createShipment: async (_, { input }, context) => {
      if (!context.user) throw new Error('Unauthorized');
      if (context.user.role !== 'admin') throw new Error('Forbidden: only admin can create shipments');
      const row = await ShipmentModel.create({
        shipperName: input.shipperName,
        carrierName: input.carrierName,
        pickupLocation: input.pickupLocation,
        deliveryLocation: input.deliveryLocation,
        trackingData: input.trackingData || {},
        rates: input.rates || {},
        status: input.status || 'pending',
      });
      return mapShipment(row);
    },

    updateShipment: async (_, { id, input }, context) => {
      if (!context.user) throw new Error('Unauthorized');
      if (context.user.role !== 'admin') throw new Error('Forbidden: only admin can update shipments');
      const row = await ShipmentModel.update(Number.parseInt(id, 10), {
        shipperName: input.shipperName,
        carrierName: input.carrierName,
        pickupLocation: input.pickupLocation,
        deliveryLocation: input.deliveryLocation,
        trackingData: input.trackingData,
        rates: input.rates,
        status: input.status,
      });
      return row ? mapShipment(row) : null;
    },
  },
};

module.exports = resolvers;
