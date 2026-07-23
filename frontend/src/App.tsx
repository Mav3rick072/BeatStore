import React, { useState } from 'react';
import { LoginForm } from './features/auth/LoginForm';
import { authService } from './features/auth/auth.service';
import { SalesView } from './features/sales/SalesView';
import type { Usuario } from './types/auth.types';

export const App: React.FC = () => {
  const [user, setUser] = useState<Usuario | null>(() => authService.getStoredUser());
  const [currentView, setCurrentView] = useState<'home' | 'pos'>('home');

  const handleLoginSuccess = () => {
    setUser(authService.getStoredUser());
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (!user) {
    return <LoginForm onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      {/* Navbar con pestañas de navegación */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold fs-4" role="button" onClick={() => setCurrentView('home')}>
            🎵 BeatStore <span className="text-primary fs-6">POS System</span>
          </span>

          <div className="collapse navbar-collapse show">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-4 gap-2">
              <li className="nav-item">
                <button 
                  className={`btn btn-sm ${currentView === 'home' ? 'btn-primary' : 'btn-outline-secondary text-white'}`}
                  onClick={() => setCurrentView('home')}
                >
                  🏠 Inicio
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`btn btn-sm ${currentView === 'pos' ? 'btn-primary' : 'btn-outline-secondary text-white'}`}
                  onClick={() => setCurrentView('pos')}
                >
                  🛒 Módulo POS / Productos
                </button>
              </li>
            </ul>
          </div>

          <div className="d-flex align-items-center gap-3 text-white">
            <div className="d-none d-md-flex flex-column text-end">
              <span className="fw-bold fs-6">{user.nombre}</span>
              <span className="badge bg-primary text-uppercase" style={{ width: 'fit-content', marginLeft: 'auto' }}>{user.rol}</span>
            </div>
            <button className="btn btn-outline-light btn-sm px-3 py-1 fw-bold" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Renderizado condicional de vistas */}
      <main className="flex-grow-1">
        {currentView === 'home' ? (
          <div className="container py-5">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-lg-8">
                <h1 className="fw-bold display-5 mb-3 text-dark">Bienvenido a BeatStore POS</h1>
                <p className="text-muted fs-5">
                  Sistema integral de gestión de ventas y control de inventario musical. Selecciona una opción en la barra superior o explora los accesos rápidos a continuación.
                </p>
              </div>
            </div>

            {/* Tarjetas de acceso rápido estilo Dashboard */}
            <div className="row g-4 justify-content-center">
              <div className="col-md-5">
                <div 
                  className="card border-0 shadow-sm p-4 h-150 text-center bg-white rounded-4" 
                  style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  onClick={() => setCurrentView('pos')}
                >
                  <div className="card-body">
                    <div className="fs-1 mb-3">🛒</div>
                    <h3 className="fw-bold fs-4 text-dark">Punto de Venta (POS)</h3>
                    <p className="text-muted">Accede al catálogo de productos musicales, búsqueda rápida y carrito de cobro.</p>
                    <span className="btn btn-primary btn-sm mt-2">Ir al Módulo</span>
                  </div>
                </div>
              </div>

              <div className="col-md-5">
                <div className="card border-0 shadow-sm p-4 h-150 text-center bg-white rounded-4">
                  <div className="card-body">
                    <div className="fs-1 mb-3">📊</div>
                    <h3 className="fw-bold fs-4 text-dark">Inventario y Reportes</h3>
                    <p className="text-muted">Consulta el estado actual de las existencias y el historial de transacciones.</p>
                    <span className="badge bg-secondary fs-6 mt-3">Próximamente / En desarrollo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <SalesView />
        )}
      </main>

      {/* Pie de página */}
      <footer className="bg-white text-muted text-center py-3 border-top mt-auto">
        <small>BeatStore Enterprise &copy; 2026 — Plataforma de Gestión Comercial</small>
      </footer>
    </div>
  );
};

export default App;