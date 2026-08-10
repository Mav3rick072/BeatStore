import React, { useEffect, useState } from 'react';
import { cashRegisterService } from './cash-register.service';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { formatCentsToMXN, pesosToCents } from '../../utils/money';
import { extractErrorMessage } from '../../utils/errors';
import type { CashRegisterSession } from '../../types/domain.types';

export const CashRegisterPage: React.FC = () => {
  const [session, setSession] = useState<CashRegisterSession | null | 'loading'>('loading');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    cashRegisterService.isOpen().then(setSession);
  };

  useEffect(load, []);

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await cashRegisterService.open(pesosToCents(Number(amount || 0)), notes || undefined);
      setAmount('');
      setNotes('');
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo abrir la caja'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await cashRegisterService.close(pesosToCents(Number(amount || 0)), notes || undefined);
      setAmount('');
      setNotes('');
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo cerrar la caja'));
    } finally {
      setSubmitting(false);
    }
  };

  if (session === 'loading') return <LoadingSpinner />;

  return (
    <div>
      <h2 className="fw-bold text-primary mb-4">Caja registradora</h2>
      <ErrorAlert message={error} onClose={() => setError(null)} />

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="beat-card p-4">
            {session ? (
              <>
                <h5 className="fw-bold mb-3">
                  <span className="badge bg-success me-2">Abierta</span>
                  Sesión actual
                </h5>
                <ul className="list-group list-group-flush mb-3">
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <span>Monto de apertura</span>
                    <span className="fw-semibold">{formatCentsToMXN(session.openingAmountInCents)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <span>Esperado en caja</span>
                    <span className="fw-semibold">{formatCentsToMXN(session.expectedAmountInCents)}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <span>Abierta desde</span>
                    <span>{new Date(session.openedAt).toLocaleString('es-MX')}</span>
                  </li>
                </ul>

                <form onSubmit={handleClose}>
                  <label className="form-label">Monto de cierre (efectivo contado)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control mb-3"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <label className="form-label">Notas</label>
                  <textarea
                    className="form-control mb-3"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
                    {submitting ? 'Cerrando...' : 'Cerrar caja'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h5 className="fw-bold mb-3">
                  <span className="badge bg-secondary me-2">Cerrada</span>
                  Abrir caja
                </h5>
                <form onSubmit={handleOpen}>
                  <label className="form-label">Monto de apertura (fondo fijo)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control mb-3"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <label className="form-label">Notas</label>
                  <textarea
                    className="form-control mb-3"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <button className="btn btn-accent w-100" type="submit" disabled={submitting}>
                    {submitting ? 'Abriendo...' : 'Abrir caja'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
