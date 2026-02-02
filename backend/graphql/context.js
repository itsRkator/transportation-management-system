/**
 * Builds GraphQL context from Express req (user from JWT) and shared helpers.
 */
const { issueToken } = require('../middleware/auth');

function buildContext({ req }) {
  return {
    user: req.user || null,
    issueToken,
  };
}

module.exports = { buildContext };
