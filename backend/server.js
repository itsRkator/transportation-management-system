/**
 * TMS API entry - Express + Apollo GraphQL.
 * MVC: routes handled by Apollo; models in models/; config in config/.
 * Centralised error handling: utils/errorHandler.js; fallback: 404 + process handlers.
 */
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const { authMiddleware } = require('./middleware/auth');
const { buildContext } = require('./graphql/context');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { pool } = require('./config/database');
const {
  formatGraphQLError,
  expressErrorHandler,
  notFoundHandler,
  logError,
} = require('./utils/errorHandler');

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.corsOrigins, credentials: true }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(authMiddleware);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: formatGraphQLError,
});

async function start() {
  await server.start();
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: buildContext,
    })
  );

  app.get('/health', async (req, res) => {
    let db = 'unknown';
    try {
      await pool.query('SELECT 1');
      db = 'connected';
    } catch (err) {
      db = 'error';
      logError(err, 'Health check DB');
    }
    const status = db === 'connected' ? 'ok' : 'degraded';
    res.status(status === 'ok' ? 200 : 503).json({
      status,
      timestamp: new Date().toISOString(),
      database: db,
    });
  });

  app.use(notFoundHandler);
  app.use(expressErrorHandler);

  app.listen(env.port, () => {
    console.log(`TMS API: http://localhost:${env.port}/graphql`);
  });
}

start().catch((err) => {
  logError(err, 'Server start');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(new Error(String(reason)), 'Unhandled Rejection');
});

process.on('uncaughtException', (err) => {
  logError(err, 'Uncaught Exception');
  process.exit(1);
});
