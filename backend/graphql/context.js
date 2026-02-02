/**
 * GraphQL context from Express req (user from access token).
 */
function buildContext({ req }) {
  return {
    user: req.user || null,
  };
}

module.exports = { buildContext };
