import React, { useState } from 'react';
import { LoginForm } from './features/auth/LoginForm';
import { authService } from './features/auth/auth.service';
import type { Usuario } from './types/auth.types';

export const App: React.FC = () => {
  const [user, setUser] = useState<Usuario | null>(() => authService.getStoredUser());

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
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
        <span className="navbar-brand fw-bold">BeatStore POS</span>
        <div className="ms-auto d-flex align-items-center gap-3 text-white">
          <span>Hola, <strong>{user.nombre}</strong> ({user.rol})</span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="container py-5 text-center">
        <h1 className="fw-bold mb-3">¡Bienvenida al Panel Principal!</h1>
        <p className="text-muted fs-5">Has iniciado sesión correctamente utilizando datos simulados.</p>
      </main>
    </div>
  );
};

export default App;