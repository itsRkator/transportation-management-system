import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { client } from './graphql/client';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Shipments from './pages/Shipments';
import Reports from './pages/Reports';
import RatesReport from './pages/RatesReport';
import Settings from './pages/Settings';
import './App.css';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="shipments" element={<Shipments />} />
              <Route path="shipments/new" element={<Shipments />} />
              <Route path="reports" element={<Reports />} />
              <Route path="reports/rates" element={<RatesReport />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ApolloProvider>
  );
}
