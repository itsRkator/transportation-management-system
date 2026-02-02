/**
 * Centralised error handling for the frontend.
 * - Normalises GraphQL/network errors to a user-facing message
 * - Logs errors in development
 */

const isDev = import.meta.env.DEV;

export function getErrorMessage(err) {
  if (!err) return 'Something went wrong';
  if (typeof err === 'string') return err;
  const msg = err.message || err.graphQLErrors?.[0]?.message || err.networkError?.message;
  return msg || 'Something went wrong';
}

export function logError(err, context = '') {
  if (!isDev) return;
  const prefix = context ? `[${context}] ` : '';
  console.error(`${prefix}${getErrorMessage(err)}`, err);
}

export function reportError(err, context = '') {
  logError(err, context);
  return getErrorMessage(err);
}
