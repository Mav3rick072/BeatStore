import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { cashRegisterService } from '../features/cash-register/cash-register.service';
import { catalogService } from '../features/catalog/catalog.service';
import type { UserRole } from '../types/auth.types';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  roles?: UserRole[];
  badge?: 'cashStatus' | 'lowStock';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    title: 'General',
    items: [{ to: '/', label: 'Dashboard', icon: 'bi-speedometer2' }],
  },
  {
    title: 'Ventas y caja',
    items: [
      { to: '/caja', label: 'Caja registradora', icon: 'bi-cash-coin', badge: 'cashStatus' },
      { to: '/ventas', label: 'Historial de ventas', icon: 'bi-receipt' },
      { to: '/devoluciones', label: 'Devoluciones', icon: 'bi-arrow-return-left' },
      { to: '/alquileres', label: 'Alquileres', icon: 'bi-calendar2-week' },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      { to: '/productos', label: 'Productos', icon: 'bi-boxes' },
      { to: '/inventario', label: 'Inventario bajo', icon: 'bi-exclamation-diamond', badge: 'lowStock' },
    ],
  },
  {
    title: 'Clientes',
    items: [
      { to: '/clientes', label: 'Clientes', icon: 'bi-people' },
      { to: '/fidelidad', label: 'Programa de fidelidad', icon: 'bi-gem' },
    ],
  },
  {
    title: 'Administración',
    items: [
      { to: '/reportes', label: 'Reportes', icon: 'bi-graph-up', roles: ['ADMIN', 'MANAGER'] },
      { to: '/usuarios', label: 'Usuarios', icon: 'bi-person-badge', roles: ['ADMIN'] },
    ],
  },
];

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  CASHIER: 'Cajero',
  WAREHOUSE: 'Almacén',
};

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/pos': 'Punto de venta',
  '/ventas': 'Historial de ventas',
  '/devoluciones': 'Devoluciones',
  '/alquileres': 'Alquileres',
  '/productos': 'Productos',
  '/inventario': 'Inventario bajo',
  '/clientes': 'Clientes',
  '/fidelidad': 'Programa de fidelidad',
  '/caja': 'Caja registradora',
  '/reportes': 'Reportes',
  '/usuarios': 'Usuarios',
};

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [cashOpen, setCashOpen] = useState<boolean | null>(null);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const refreshIndicators = () => {
      cashRegisterService.isOpen().then((session) => setCashOpen(!!session));
      catalogService.lowStock().then((items) => setLowStockCount(items.length));
    };
    refreshIndicators();
    // Refresca cada 30s para que los indicadores no queden desactualizados
    // mientras el usuario navega entre pantallas.
    const interval = setInterval(refreshIndicators, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderBadge = (item: NavItem) => {
    if (item.badge === 'cashStatus' && cashOpen !== null) {
      return (
        <span className={`ms-auto badge rounded-pill ${cashOpen ? 'bg-success' : 'bg-secondary'}`}>
          {cashOpen ? 'Abierta' : 'Cerrada'}
        </span>
      );
    }
    if (item.badge === 'lowStock' && lowStockCount > 0) {
      return <span className="ms-auto badge rounded-pill bg-danger">{lowStockCount}</span>;
    }
    return null;
  };

  const currentTitle = PAGE_TITLES[location.pathname] ?? 'BeatStore';

  return (
    <div className="beat-shell">
      <aside className="beat-sidebar">
        <NavLink to="/" className="brand text-decoration-none">
          <i className="bi bi-vinyl-fill accent" style={{ fontSize: '1.4rem' }} />
          BeatStore <span className="accent">POS</span>
        </NavLink>

        <div className="px-3 mb-2">
          <NavLink to="/pos" className="btn btn-accent w-100 d-flex align-items-center justify-content-center gap-2 py-2">
            <i className="bi bi-cart-plus-fill" />
            Nueva venta
          </NavLink>
        </div>

        <nav>
          {SECTIONS.map((section) => {
            const items = section.items.filter(
              (item) => !item.roles || item.roles.includes(user.role),
            );
            if (items.length === 0) return null;
            return (
              <div key={section.title}>
                <div className="beat-nav-section">{section.title}</div>
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `beat-nav-link${isActive ? ' active' : ''}`
                    }
                  >
                    <i className={`bi ${item.icon}`} />
                    {item.label}
                    {renderBadge(item)}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="beat-sidebar-footer">
          <div className="d-flex align-items-center gap-2 mb-2">
            <div
              className="rounded-circle bg-accent d-flex align-items-center justify-content-center fw-bold"
              style={{ width: 36, height: 36, color: '#ffffff' }}
            >
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </div>
            <div className="small">
              <div className="fw-semibold text-white">
                {user.firstName} {user.lastName}
              </div>
              <div style={{ color: '#9aa0b4' }}>{ROLE_LABEL[user.role]}</div>
            </div>
          </div>
          <button className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1" /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="beat-main">
        <header className="beat-topbar">
          <div>
            <div className="fw-bold text-primary fs-5">{currentTitle}</div>
            <div className="text-muted small">
              <i className="bi bi-shop me-1" />
              Tienda de instrumentos musicales
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            {cashOpen !== null && (
              <span className={`badge rounded-pill ${cashOpen ? 'bg-success' : 'bg-secondary'}`}>
                <i className={`bi ${cashOpen ? 'bi-unlock' : 'bi-lock'} me-1`} />
                Caja {cashOpen ? 'abierta' : 'cerrada'}
              </span>
            )}
            <div className="text-muted small d-none d-md-block">
              {new Date().toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </header>
        <main className="beat-content">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
