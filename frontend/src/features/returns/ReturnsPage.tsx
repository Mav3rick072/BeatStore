import React, { useEffect, useState } from 'react';
import { returnsService } from './returns.service';
import { salesService } from '../sales/sales.service';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { formatCentsToMXN } from '../../utils/money';
import { extractErrorMessage } from '../../utils/errors';
import type { SaleReturn } from '../../types/domain.types';
import type { Sale } from '../../types/sales.types';

export const ReturnsPage: React.FC = () => {
  const [returns, setReturns] = useState<SaleReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
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

  const handleLoadSale = async () => {
    setError(null);
    try {
      const found = await salesService.findOne(saleId.trim());
      setSale(found);
      setQuantities({});
    } catch (err) {
      setError(extractErrorMessage(err, 'No se encontró la venta'));
      setSale(null);
    }
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
          <div className="input-group mb-3" style={{ maxWidth: 480 }}>
            <input
              className="form-control"
              placeholder="ID de la venta"
              value={saleId}
              onChange={(e) => setSaleId(e.target.value)}
            />
            <button className="btn btn-outline-primary" type="button" onClick={handleLoadSale}>
              Buscar venta
            </button>
          </div>

          {sale && (
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
