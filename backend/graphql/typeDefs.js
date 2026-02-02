/**
 * GraphQL type definitions (schema).
 */
const { gql } = require('graphql-tag');

const typeDefs = gql`
  scalar DateTime
  scalar JSON

  type User {
    id: ID!
    email: String!
    role: String!
    createdAt: DateTime
  }

  type Shipment {
    id: ID!
    shipperName: String!
    carrierName: String!
    pickupLocation: String!
    deliveryLocation: String!
    trackingData: JSON
    rates: JSON
    status: String!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type ShipmentConnection {
    items: [Shipment!]!
    total: Int!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    total: Int!
    limit: Int!
    offset: Int!
  }

  type StatusCount {
    status: String!
    count: Int!
  }

  type CarrierStats {
    carrierName: String!
    count: Int!
    totalFreight: Float!
  }

  type ShipmentStats {
    total: Int!
    byStatus: [StatusCount!]!
    totalFreight: Float!
    byCarrier: [CarrierStats!]!
  }

  input ShipmentFilters {
    shipperName: String
    carrierName: String
    status: String
  }

  input CreateShipmentInput {
    shipperName: String!
    carrierName: String!
    pickupLocation: String!
    deliveryLocation: String!
    trackingData: JSON
    rates: JSON
    status: String
  }

  input UpdateShipmentInput {
    shipperName: String
    carrierName: String
    pickupLocation: String
    deliveryLocation: String
    trackingData: JSON
    rates: JSON
    status: String
  }

  type Query {
    me: User
    shipment(id: ID!): Shipment
    shipments(
      filters: ShipmentFilters
      sortBy: String
      sortOrder: String
      limit: Int
      offset: Int
    ): ShipmentConnection!
    shipmentStats: ShipmentStats!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    createShipment(input: CreateShipmentInput!): Shipment!
    updateShipment(id: ID!, input: UpdateShipmentInput!): Shipment
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;

module.exports = typeDefs;
