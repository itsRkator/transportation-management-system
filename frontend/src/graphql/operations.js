import { gql } from '@apollo/client';

export const REGISTER = gql`
  mutation Register($email: String!, $password: String!, $role: String) {
    register(email: $email, password: $password, role: $role) {
      accessToken
      refreshToken
      user { id email role }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
      user { id email role }
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      user { id email role }
    }
  }
`;

export const ME = gql`
  query Me {
    me { id email role }
  }
`;

export const SHIPMENTS = gql`
  query Shipments($filters: ShipmentFilters, $sortBy: String, $sortOrder: String, $limit: Int, $offset: Int) {
    shipments(filters: $filters, sortBy: $sortBy, sortOrder: $sortOrder, limit: $limit, offset: $offset) {
      items {
        id shipperName carrierName pickupLocation deliveryLocation trackingData rates status createdAt
      }
      total
      pageInfo { hasNextPage hasPreviousPage total limit offset }
    }
  }
`;

export const SHIPMENT = gql`
  query Shipment($id: ID!) {
    shipment(id: $id) {
      id shipperName carrierName pickupLocation deliveryLocation trackingData rates status createdAt updatedAt
    }
  }
`;

export const CREATE_SHIPMENT = gql`
  mutation CreateShipment($input: CreateShipmentInput!) {
    createShipment(input: $input) {
      id shipperName carrierName pickupLocation deliveryLocation trackingData rates status createdAt
    }
  }
`;

export const UPDATE_SHIPMENT = gql`
  mutation UpdateShipment($id: ID!, $input: UpdateShipmentInput!) {
    updateShipment(id: $id, input: $input) {
      id shipperName carrierName pickupLocation deliveryLocation trackingData rates status updatedAt
    }
  }
`;

export const SHIPMENT_STATS = gql`
  query ShipmentStats {
    shipmentStats {
      total
      byStatus { status count }
      totalFreight
      byCarrier { carrierName count totalFreight }
    }
  }
`;
