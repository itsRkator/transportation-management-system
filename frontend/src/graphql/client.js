import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { print } from 'graphql';
import { REFRESH_TOKEN } from './operations';
import { logError } from '../utils/errorHandler';

const ACCESS_TOKEN_KEY = 'tms_token';
const REFRESH_TOKEN_KEY = 'tms_refresh_token';

const graphqlUri = import.meta.env.VITE_GRAPHQL_URI || '/graphql';

const httpLink = createHttpLink({
  uri: graphqlUri,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

let isRefreshing = false;
let pendingQueue = [];

function resolvePending(accessToken) {
  pendingQueue.forEach((resolve) => resolve(accessToken));
  pendingQueue = [];
}

async function doRefresh(refreshToken) {
  const res = await fetch(graphqlUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: print(REFRESH_TOKEN),
      variables: { refreshToken },
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || 'Refresh failed');
  return json.data?.refreshToken;
}

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors?.length) {
    graphQLErrors.forEach((e) => logError(e, 'GraphQL'));
  }
  if (networkError) {
    logError(networkError, 'Network');
  }

  const authError = graphQLErrors?.some(
    (e) => e.message?.toLowerCase().includes('unauthorized') || e.message?.toLowerCase().includes('jwt expired')
  );
  if (!authError) return forward(operation);

  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('tms_user');
    return forward(operation);
  }

  if (isRefreshing) {
    return new Promise((resolve) => {
      pendingQueue.push((newAccessToken) => {
        if (newAccessToken) {
          operation.setContext(({ headers = {} }) => ({
            headers: { ...headers, authorization: `Bearer ${newAccessToken}` },
          }));
        }
        resolve(forward(operation));
      });
    });
  }

  isRefreshing = true;
  return doRefresh(refreshToken)
    .then((data) => {
      if (data) {
        const { accessToken: newAccess, refreshToken: newRefresh, user } = data;
        localStorage.setItem(ACCESS_TOKEN_KEY, newAccess);
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);
        if (user) localStorage.setItem('tms_user', JSON.stringify(user));
        resolvePending(newAccess);
        operation.setContext(({ headers = {} }) => ({
          headers: { ...headers, authorization: `Bearer ${newAccess}` },
        }));
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem('tms_user');
        resolvePending(null);
        try {
          window.dispatchEvent(new CustomEvent('tms-session-expired'));
        } catch (_) {}
      }
      return forward(operation);
    })
    .catch(() => {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem('tms_user');
      resolvePending(null);
      try {
        window.dispatchEvent(new CustomEvent('tms-session-expired'));
      } catch (_) {}
      return forward(operation);
    })
    .finally(() => {
      isRefreshing = false;
    });
});

export const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
});

export { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY };
