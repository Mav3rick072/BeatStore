import React, { useEffect, useState } from 'react';
import { catalogService } from './catalog.service';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { Product } from '../../types/catalog.types';

export const LowStockPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalogService
      .lowStock()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="fw-bold text-primary mb-1">Inventario con stock bajo</h2>
      <p className="text-muted mb-4">Productos que alcanzaron o están por debajo de su stock mínimo.</p>

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className="beat-card p-5 text-center text-muted">
          <i className="bi bi-check-circle display-4 text-primary mb-3 d-block" />
          Todo el inventario está en niveles saludables.
        </div>
      ) : (
        <div className="beat-card p-0">
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th>Stock actual</th>
                <th>Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="fw-semibold">{p.name}</td>
                  <td>
                    <code>{p.sku}</code>
                  </td>
                  <td>
                    <span className="badge bg-danger">{p.stock.quantity}</span>
                  </td>
                  <td>{p.stock.minStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
