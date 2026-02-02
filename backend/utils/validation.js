/**
 * Input validation helpers for auth and shipment data.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;
const MAX_STRING_LENGTH = 500;

function validateEmail(email) {
  if (typeof email !== 'string' || !email.trim()) {
    throw new Error('Email is required');
  }
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > 254) {
    throw new Error('Email is too long');
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    throw new Error('Invalid email format');
  }
  return trimmed;
}

function validatePassword(password, fieldName = 'Password') {
  if (typeof password !== 'string') {
    throw new TypeError(`${fieldName} is required`);
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`${fieldName} must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new Error(`${fieldName} must be at most ${MAX_PASSWORD_LENGTH} characters`);
  }
  return password;
}

function validateRole(role) {
  if (role == null || role === '') return null;
  if (typeof role !== 'string') return null;
  const r = role.trim().toLowerCase();
  return r === 'admin' || r === 'employee' ? r : 'employee';
}

function validateNonEmptyString(value, fieldName, maxLength = MAX_STRING_LENGTH) {
  if (value == null || (typeof value === 'string' && !value.trim())) {
    throw new Error(`${fieldName} is required`);
  }
  const str = String(value).trim();
  if (str.length > maxLength) {
    throw new Error(`${fieldName} must be at most ${maxLength} characters`);
  }
  return str;
}

function validateOptionalString(value, maxLength = MAX_STRING_LENGTH) {
  if (value == null || value === '') return null;
  const str = String(value).trim();
  if (str.length > maxLength) {
    throw new Error(`Value must be at most ${maxLength} characters`);
  }
  return str || null;
}

function validateStatus(status) {
  const allowed = ['pending', 'in_transit', 'delivered', 'cancelled'];
  if (status == null || status === '') return 'pending';
  const s = String(status).trim().toLowerCase();
  if (!allowed.includes(s)) {
    throw new Error(`Status must be one of: ${allowed.join(', ')}`);
  }
  return s;
}

function validateCreateShipmentInput(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('Shipment input is required');
  }
  return {
    shipperName: validateNonEmptyString(input.shipperName, 'Shipper name'),
    carrierName: validateNonEmptyString(input.carrierName, 'Carrier name'),
    pickupLocation: validateNonEmptyString(input.pickupLocation, 'Pickup location'),
    deliveryLocation: validateNonEmptyString(input.deliveryLocation, 'Delivery location'),
    trackingData: typeof input.trackingData === 'object' && input.trackingData !== null ? input.trackingData : {},
    rates: typeof input.rates === 'object' && input.rates !== null ? input.rates : {},
    status: validateStatus(input.status),
  };
}

function validateUpdateShipmentInput(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('Update input is required');
  }
  const out = {};
  if (input.shipperName !== undefined) out.shipperName = validateNonEmptyString(input.shipperName, 'Shipper name');
  if (input.carrierName !== undefined) out.carrierName = validateNonEmptyString(input.carrierName, 'Carrier name');
  if (input.pickupLocation !== undefined) out.pickupLocation = validateNonEmptyString(input.pickupLocation, 'Pickup location');
  if (input.deliveryLocation !== undefined) out.deliveryLocation = validateNonEmptyString(input.deliveryLocation, 'Delivery location');
  if (input.trackingData !== undefined) out.trackingData = typeof input.trackingData === 'object' && input.trackingData !== null ? input.trackingData : {};
  if (input.rates !== undefined) out.rates = typeof input.rates === 'object' && input.rates !== null ? input.rates : {};
  if (input.status !== undefined) out.status = validateStatus(input.status);
  return out;
}

module.exports = {
  validateEmail,
  validatePassword,
  validateRole,
  validateCreateShipmentInput,
  validateUpdateShipmentInput,
};