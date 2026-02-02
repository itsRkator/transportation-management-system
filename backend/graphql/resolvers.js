/**
 * GraphQL resolvers (MVC - controller layer).
 */
const ShipmentModel = require('../models/Shipment');
const UserModel = require('../models/User');
const RefreshTokenModel = require('../models/RefreshToken');
const { GraphQLScalarType, Kind } = require('graphql');
const {
  issueAccessToken,
  createStoredRefreshToken,
  findUserByStoredRefreshToken,
  revokeRefreshToken,
} = require('../middleware/auth');
const {
  validateEmail,
  validatePassword,
  validateRole,
  validateCreateShipmentInput,
  validateUpdateShipmentInput,
} = require('../utils/validation');

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
    register: async (_, { email, password, role: inputRole }, context) => {
      const validatedEmail = validateEmail(email);
      validatePassword(password);
      const role = validateRole(inputRole) || 'employee';
      const existing = await UserModel.findByEmail(validatedEmail);
      if (existing) throw new Error('Email already registered');
      const user = await UserModel.create({ email: validatedEmail, password, role });
      const accessToken = issueAccessToken({ id: user.id, role: user.role });
      const { plain: refreshToken } = await createStoredRefreshToken(user.id);
      return {
        accessToken,
        refreshToken,
        user: { id: String(user.id), email: user.email, role: user.role, createdAt: user.created_at },
      };
    },

    login: async (_, { email, password }) => {
      const validatedEmail = validateEmail(email);
      validatePassword(password);
      const user = await UserModel.findByEmail(validatedEmail);
      if (!user) throw new Error('Invalid email or password');
      const valid = await UserModel.verifyPassword(password, user.password_hash);
      if (!valid) throw new Error('Invalid email or password');
      const accessToken = issueAccessToken({ id: user.id, role: user.role });
      const { plain: refreshToken } = await createStoredRefreshToken(user.id);
      return {
        accessToken,
        refreshToken,
        user: { id: String(user.id), email: user.email, role: user.role, createdAt: user.created_at },
      };
    },

    refreshToken: async (_, { refreshToken: token }) => {
      const found = await findUserByStoredRefreshToken(token);
      if (!found) throw new Error('Invalid or expired refresh token');
      const user = await UserModel.findById(found.userId);
      if (!user) throw new Error('User not found');
      await revokeRefreshToken(token);
      const accessToken = issueAccessToken({ id: user.id, role: user.role });
      const { plain: refreshToken } = await createStoredRefreshToken(user.id);
      return {
        accessToken,
        refreshToken,
        user: { id: String(user.id), email: user.email, role: user.role, createdAt: user.created_at },
      };
    },

    createShipment: async (_, { input }, context) => {
      if (!context.user) throw new Error('Unauthorized');
      if (context.user.role !== 'admin') throw new Error('Forbidden: only admin can create shipments');
      const validated = validateCreateShipmentInput(input);
      const row = await ShipmentModel.create(validated);
      return mapShipment(row);
    },

    updateShipment: async (_, { id, input }, context) => {
      if (!context.user) throw new Error('Unauthorized');
      if (context.user.role !== 'admin') throw new Error('Forbidden: only admin can update shipments');
      const validated = validateUpdateShipmentInput(input);
      if (Object.keys(validated).length === 0) throw new Error('No valid fields to update');
      const row = await ShipmentModel.update(Number.parseInt(id, 10), validated);
      return row ? mapShipment(row) : null;
    },
  },
};

module.exports = resolvers;
