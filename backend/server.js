/**
 * TMS API entry - Express + Apollo GraphQL.
 * MVC: routes handled by Apollo; models in models/; config in config/.
 */
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const { authMiddleware } = require('./middleware/auth');
const { buildContext } = require('./graphql/context');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.corsOrigins, credentials: true }));
app.use(express.json());
app.use(authMiddleware);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    if (env.nodeEnv === 'production') {
      return { message: err.message };
    }
    return err;
  },
});

async function start() {
  await server.start();
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: buildContext,
    })
  );

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.listen(env.port, () => {
    console.log(`TMS API: http://localhost:${env.port}/graphql`);
  });
}

start().catch((err) => {
  console.error('Server start failed:', err);
  process.exit(1);
});
