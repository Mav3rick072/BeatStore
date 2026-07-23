import React from 'react';

export default function App() {
  return (
    <div className="container my-5">
      <div className="card shadow-sm border-0">
        <div className="card-body text-center p-5">
          <i className="bi bi-music-note-beamed text-primary display-1 mb-3"></i>
          <h1 className="fw-bold text-dark mb-2">BeatStore POS</h1>
          <p className="text-muted mb-4">
            Sistema de Punto de Venta y Gestión de Inventarios
          </p>
          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fs-6">
            <i className="bi bi-check-circle-fill me-2"></i>
            Entorno Frontend Configurado Exitosamente
          </span>
        </div>
      </div>
    </div>
  );
}

