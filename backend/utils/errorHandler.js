/**
 * Centralised error handling for the API.
 * - Normalises errors to a consistent shape
 * - Logs with stack in development
 * - Returns safe message in production
 */
const env = require('../config/env');

const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL: 'INTERNAL_SERVER_ERROR',
};

function normaliseError(err) {
  const message = err?.message || 'An unexpected error occurred';
  const code = err?.extensions?.code || err?.code || ERROR_CODES.INTERNAL;
  return {
    message,
    ...(env.nodeEnv !== 'production' && { extensions: { code, ...err?.extensions } }),
  };
}

function logError(err, context = '') {
  const prefix = context ? `[${context}] ` : '';
  console.error(`${prefix}${err?.message || err}`);
  if (env.nodeEnv !== 'production' && err?.stack) {
    console.error(err.stack);
  }
}

/**
 * Apollo Server formatError: use this for consistent GraphQL error responses.
 */
function formatGraphQLError(err) {
  logError(err, 'GraphQL');
  return normaliseError(err);
}

/**
 * Express error middleware handler (for non-GraphQL routes).
 */
function expressErrorHandler(err, req, res, next) {
  logError(err, 'Express');
  const status = err.status || err.statusCode || 500;
  const payload = env.nodeEnv === 'production'
    ? { message: 'Internal server error' }
    : normaliseError(err);
  res.status(status).json(payload);
}

/**
 * 404 fallback for unknown routes.
 */
function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Not found', code: ERROR_CODES.NOT_FOUND });
}

module.exports = {
  ERROR_CODES,
  normaliseError,
  logError,
  formatGraphQLError,
  expressErrorHandler,
  notFoundHandler,
};
