import React, { useEffect, useState } from 'react';
import { rentalsService } from './rentals.service';
import { catalogService } from '../catalog/catalog.service';
import { clientsService } from '../clients/clients.service';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { formatCentsToMXN, pesosToCents } from '../../utils/money';
import { extractErrorMessage } from '../../utils/errors';
import type { Rental } from '../../types/domain.types';
import type { Product } from '../../types/catalog.types';
import type { Client } from '../../types/domain.types';

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-primary',
  RETURNED: 'bg-accent',
  OVERDUE: 'bg-danger',
  CANCELLED: 'bg-secondary',
};
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Activo',
  RETURNED: 'Devuelto',
  OVERDUE: 'Vencido',
  CANCELLED: 'Cancelado',
};

const emptyForm = { productId: '', clientId: '', quantity: '1', depositInCents: '', dueDate: '' };

export const RentalsPage: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [rentableProducts, setRentableProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    rentalsService
      .findAll()
      .then(setRentals)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    catalogService.searchProducts({ rentable: true }).then(setRentableProducts);
    clientsService.findAll().then(setClients).catch(() => setClients([]));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await rentalsService.create({
        productId: form.productId,
        clientId: form.clientId,
        quantity: Number(form.quantity || 1),
        depositInCents: pesosToCents(Number(form.depositInCents || 0)),
        dueDate: new Date(form.dueDate).toISOString(),
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo registrar el alquiler'));
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = async (id: string) => {
    setError(null);
    try {
      await rentalsService.returnRental(id, {});
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo procesar la devolución del alquiler'));
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">Alquileres</h2>
          <p className="text-muted mb-0">Instrumentos y equipo alquilado a clientes.</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowForm((v) => !v)}>
          <i className="bi bi-calendar-plus me-1" /> Nuevo alquiler
        </button>
      </div>

      <ErrorAlert message={error} onClose={() => setError(null)} />

      {showForm && (
        <form className="beat-card p-4 mb-4" onSubmit={handleCreate}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Producto alquilable</label>
              <select
                className="form-select"
                required
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
              >
                <option value="">Elige...</option>
                {rentableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatCentsToMXN(p.rentalPriceInCents ?? 0)}/día
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Cliente</label>
              <select
                className="form-select"
                required
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              >
                <option value="">Elige...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-1">
              <label className="form-label">Cant.</label>
              <input
                type="number"
                min={1}
                className="form-control"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Depósito (MXN)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="form-control"
                required
                value={form.depositInCents}
                onChange={(e) => setForm({ ...form, depositInCents: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Fecha de devolución</label>
              <input
                type="date"
                className="form-control"
                required
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Registrar alquiler'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="beat-card p-0">
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Vence</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((r) => (
                <tr key={r.id}>
                  <td className="fw-semibold">{r.productName}</td>
                  <td>{r.quantity}</td>
                  <td>{new Date(r.dueDate).toLocaleDateString('es-MX')}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                  </td>
                  <td>
                    {r.status === 'ACTIVE' || r.status === 'OVERDUE' ? (
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleReturn(r.id)}>
                        Marcar devuelto
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {rentals.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    No hay alquileres registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
