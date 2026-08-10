import React, { useEffect, useState } from 'react';
import { salesService } from './sales.service';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatCentsToMXN } from '../../utils/money';
import type { Sale } from '../../types/sales.types';

const STATUS_BADGE: Record<string, string> = {
  COMPLETED: 'bg-accent',
  PENDING: 'bg-secondary',
  CANCELLED: 'bg-danger',
  RETURNED: 'bg-danger',
  PARTIALLY_RETURNED: 'bg-danger',
};

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: 'Completada',
  PENDING: 'Pendiente',
  CANCELLED: 'Cancelada',
  RETURNED: 'Devuelta',
  PARTIALLY_RETURNED: 'Parcialmente devuelta',
};

export const SalesHistoryPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    salesService
      .findAll()
      .then(setSales)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="fw-bold text-primary mb-4">Historial de ventas</h2>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="beat-card p-0">
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Artículos</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Puntos otorgados</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{new Date(sale.createdAt).toLocaleString('es-MX')}</td>
                  <td>{sale.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                  <td className="fw-semibold">{formatCentsToMXN(sale.totalInCents)}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[sale.status] ?? 'bg-secondary'}`}>
                      {STATUS_LABEL[sale.status] ?? sale.status}
                    </span>
                  </td>
                  <td>{sale.loyaltyPointsEarned || '—'}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    Aún no hay ventas registradas.
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
