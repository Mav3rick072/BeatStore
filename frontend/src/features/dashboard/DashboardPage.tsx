import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { cashRegisterService } from '../cash-register/cash-register.service';
import { catalogService } from '../catalog/catalog.service';
import { reportsService, type SalesSummary } from '../reports/reports.service';
import { StatCard } from '../../components/StatCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatCentsToMXN } from '../../utils/money';
import type { CashRegisterSession } from '../../types/domain.types';
import type { Product } from '../../types/catalog.types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [register, setRegister] = useState<CashRegisterSession | null>(null);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const canSeeReports = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);
      const [registerResult, lowStockResult, summaryResult] = await Promise.allSettled([
        cashRegisterService.isOpen(),
        catalogService.lowStock(),
        canSeeReports ? reportsService.summary({ from: today }) : Promise.resolve(null),
      ]);

      if (registerResult.status === 'fulfilled') setRegister(registerResult.value);
      if (lowStockResult.status === 'fulfilled') setLowStock(lowStockResult.value.slice(0, 5));
      if (summaryResult.status === 'fulfilled' && summaryResult.value) setSummary(summaryResult.value);

      setLoading(false);
    };
    load();
  }, [canSeeReports]);

  if (loading) return <LoadingSpinner label="Cargando panel..." />;

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold text-primary mb-1">Hola, {user?.firstName} 👋</h2>
        <p className="text-muted">Este es el resumen de hoy en BeatStore.</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <StatCard
            label="Caja"
            value={register ? 'Abierta' : 'Cerrada'}
            icon={register ? 'bi-unlock' : 'bi-lock'}
          />
        </div>
        {summary && (
          <>
            <div className="col-md-3">
              <StatCard label="Ventas de hoy" value={String(summary.totalSales)} icon="bi-receipt" accent />
            </div>
            <div className="col-md-3">
              <StatCard
                label="Ingresos de hoy"
                value={formatCentsToMXN(summary.totalRevenueInCents)}
                icon="bi-cash-stack"
              />
            </div>
            <div className="col-md-3">
              <StatCard label="Artículos vendidos" value={String(summary.totalItemsSold)} icon="bi-boxes" accent />
            </div>
          </>
        )}
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="beat-card p-4 h-100">
            <h5 className="fw-bold mb-3">Accesos rápidos</h5>
            <div className="row g-3">
              <div className="col-6">
                <Link to="/pos" className="btn btn-primary w-100 py-3">
                  <i className="bi bi-cart3 d-block fs-3 mb-1" />
                  Nueva venta
                </Link>
              </div>
              <div className="col-6">
                <Link to="/caja" className="btn btn-accent w-100 py-3">
                  <i className="bi bi-cash-coin d-block fs-3 mb-1" />
                  {register ? 'Ver caja' : 'Abrir caja'}
                </Link>
              </div>
              <div className="col-6">
                <Link to="/productos" className="btn btn-outline-primary w-100 py-3">
                  <i className="bi bi-boxes d-block fs-3 mb-1" />
                  Productos
                </Link>
              </div>
              <div className="col-6">
                <Link to="/clientes" className="btn btn-outline-primary w-100 py-3">
                  <i className="bi bi-people d-block fs-3 mb-1" />
                  Clientes
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="beat-card p-4 h-100">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-exclamation-diamond text-accent me-2" />
              Stock bajo
            </h5>
            {lowStock.length === 0 ? (
              <p className="text-muted mb-0">No hay productos con stock bajo. 🎉</p>
            ) : (
              <ul className="list-group list-group-flush">
                {lowStock.map((p) => (
                  <li key={p.id} className="list-group-item d-flex justify-content-between px-0">
                    <span>{p.name}</span>
                    <span className="badge bg-secondary">{p.stock.quantity} pzas</span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/inventario" className="btn btn-sm btn-outline-primary w-100 mt-3">
              Ver todo el inventario
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
