import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';

import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { POSPage } from './features/sales/POSPage';
import { SalesHistoryPage } from './features/sales/SalesHistoryPage';
import { ProductsPage } from './features/catalog/ProductsPage';
import { LowStockPage } from './features/catalog/LowStockPage';
import { ClientsPage } from './features/clients/ClientsPage';
import { CashRegisterPage } from './features/cash-register/CashRegisterPage';
import { ReturnsPage } from './features/returns/ReturnsPage';
import { RentalsPage } from './features/rentals/RentalsPage';
import { LoyaltyPage } from './features/loyalty/LoyaltyPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { UsersPage } from './features/users/UsersPage';

const LoginRoute: React.FC = () => {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <LoginPage />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/ventas" element={<SalesHistoryPage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/inventario" element={<LowStockPage />} />
            <Route path="/clientes" element={<ClientsPage />} />
            <Route path="/caja" element={<CashRegisterPage />} />
            <Route path="/devoluciones" element={<ReturnsPage />} />
            <Route path="/alquileres" element={<RentalsPage />} />
            <Route path="/fidelidad" element={<LoyaltyPage />} />
            <Route
              path="/reportes"
              element={
                <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
