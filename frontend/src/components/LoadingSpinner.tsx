import React from 'react';

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Cargando...' }) => (
  <div className="d-flex align-items-center justify-content-center gap-2 py-5 text-muted">
    <span className="spinner-border spinner-beat" role="status" aria-hidden="true" />
    <span>{label}</span>
  </div>
);
