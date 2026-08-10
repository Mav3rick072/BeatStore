import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth.types';

export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  roles?: UserRole[];
}> = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="beat-card p-5 text-center">
        <i className="bi bi-shield-lock display-4 text-primary mb-3 d-block" />
        <h4 className="fw-bold">Acceso restringido</h4>
        <p className="text-muted mb-0">No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  return <>{children}</>;
};
