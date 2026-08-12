import React, { useEffect, useState } from 'react';
import { returnsService } from './returns.service';
import { salesService } from '../sales/sales.service';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { formatCentsToMXN } from '../../utils/money';
import { extractErrorMessage } from '../../utils/errors';
import type { SaleReturn } from '../../types/domain.types';
import type { Sale } from '../../types/sales.types';

// Una venta es elegible para devolución si tiene al menos un artículo
// con cantidad disponible por devolver (vendido - ya devuelto > 0).
const hasReturnableItems = (sale: Sale) =>
  Array.isArray(sale.items) &&
  sale.items.some((item) => item.quantity - item.returnedQuantity > 0);

const saleOptionLabel = (sale: Sale) => {
  const date = new Date(sale.createdAt).toLocaleDateString('es-MX');
  const folio = sale.id.slice(-8);
  return `${date} · #${folio} · ${formatCentsToMXN(sale.totalInCents)}`;
};

export const ReturnsPage: React.FC = () => {
  const [returns, setReturns] = useState<SaleReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [eligibleSales, setEligibleSales] = useState<Sale[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);

  const [saleId, setSaleId] = useState('');
  const [sale, setSale] = useState<Sale | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    returnsService
      .findAll()
      .then(setReturns)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Carga la lista de ventas disponibles para devolución al abrir el formulario.
  useEffect(() => {
    if (!showForm) return;
    setSalesLoading(true);
    setError(null);
    salesService
      .findAll()
      .then((all) => setEligibleSales(all.filter(hasReturnableItems)))
      .catch((err) => setError(extractErrorMessage(err, 'No se pudieron cargar las ventas')))
      .finally(() => setSalesLoading(false));
  }, [showForm]);

  const handleSelectSale = (id: string) => {
    setSaleId(id);
    setError(null);
    const found = eligibleSales.find((s) => s.id === id) ?? null;
    setSale(found);
    setQuantities({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale) return;
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));

    if (items.length === 0) {
      setError('Indica al menos una cantidad a devolver');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await returnsService.create({ saleId: sale.id, items, reason });
      setShowForm(false);
      setSale(null);
      setSaleId('');
      setReason('');
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo registrar la devolución'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">Devoluciones</h2>
          <p className="text-muted mb-0">Registra devoluciones parciales o totales de una venta.</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowForm((v) => !v)}>
          <i className="bi bi-arrow-return-left me-1" /> Nueva devolución
        </button>
      </div>

      <ErrorAlert message={error} onClose={() => setError(null)} />

      {showForm && (
        <div className="beat-card p-4 mb-4">
          <label className="form-label">Selecciona la venta</label>
          <select
            className="form-select mb-3"
            style={{ maxWidth: 480 }}
            value={saleId}
            disabled={salesLoading}
            onChange={(e) => handleSelectSale(e.target.value)}
          >
            <option value="">
              {salesLoading ? 'Cargando ventas...' : 'Elige una venta...'}
            </option>
            {eligibleSales.map((s) => (
              <option key={s.id} value={s.id}>
                {saleOptionLabel(s)}
              </option>
            ))}
          </select>

          {!salesLoading && eligibleSales.length === 0 && (
            <p className="text-muted small">
              No hay ventas con artículos disponibles para devolver.
            </p>
          )}

          {sale && Array.isArray(sale.items) && (
            <form onSubmit={handleSubmit}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Vendido</th>
                    <th>Ya devuelto</th>
                    <th>Cantidad a devolver</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item) => {
                    const remaining = item.quantity - item.returnedQuantity;
                    return (
                      <tr key={item.productId}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.returnedQuantity}</td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            max={remaining}
                            className="form-control form-control-sm"
                            style={{ width: 90 }}
                            disabled={remaining <= 0}
                            value={quantities[item.productId] ?? 0}
                            onChange={(e) =>
                              setQuantities({
                                ...quantities,
                                [item.productId]: Number(e.target.value),
                              })
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <label className="form-label">Motivo</label>
              <textarea
                className="form-control mb-3"
                rows={2}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Registrando...' : 'Registrar devolución'}
              </button>
            </form>
          )}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="beat-card p-0">
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Venta</th>
                <th>Total reembolsado</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.createdAt).toLocaleString('es-MX')}</td>
                  <td>
                    <code>{r.saleId.slice(-8)}</code>
                  </td>
                  <td className="fw-semibold">{formatCentsToMXN(r.totalRefundedInCents)}</td>
                  <td>{r.reason}</td>
                </tr>
              ))}
              {returns.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    No hay devoluciones registradas.
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