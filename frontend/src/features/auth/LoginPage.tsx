import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../utils/errors';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'Correo o contraseña incorrectos'));
    }
  };

  return (
    <div className="beat-login-page p-3">
      <div className="card shadow-lg border-0 w-100" style={{ maxWidth: 420, borderRadius: '1rem' }}>
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4">
            <div
              className="bg-accent text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: 68, height: 68 }}
            >
              <i className="bi bi-vinyl-fill fs-2" />
            </div>
            <h2 className="fw-bold text-primary mb-1">BeatStore</h2>
            <p className="text-muted mb-0">Sistema de punto de venta</p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Correo electrónico
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-envelope text-muted" />
                </span>
                <input
                  type="email"
                  id="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="gerente@beatstore.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-semibold">
                Contraseña
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-lock text-muted" />
                </span>
                <input
                  type="password"
                  id="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2" />
                  Ingresar
                </>
              )}
            </button>
          </form>

          <p className="text-center text-muted small mt-4 mb-0">
            Usuarios de prueba: admin@beatstore.com · gerente@beatstore.com · cajero@beatstore.com
            <br />
            Contraseña: BeatStore123
          </p>
        </div>
      </div>
    </div>
  );
};
