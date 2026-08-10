import React, { useEffect, useState } from 'react';
import { reportsService, type PaymentMethodBreakdown, type SalesByDay, type SalesSummary, type TopProduct } from './reports.service';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatCard } from '../../components/StatCard';
import { formatCentsToMXN } from '../../utils/money';
import { generateSalesReportPdf } from '../../utils/reportPdf';

export const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [byDay, setByDay] = useState<SalesByDay[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodBreakdown[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = (range: { from?: string; to?: string } = {}) => {
    setLoading(true);
    Promise.all([
      reportsService.summary(range),
      reportsService.byDay(range),
      reportsService.topProducts({ ...range, limit: 5 }),
      reportsService.paymentMethods(range),
    ])
      .then(([summaryData, byDayData, topData, paymentData]) => {
        setSummary(summaryData);
        setByDay(byDayData);
        setTopProducts(topData);
        setPaymentMethods(paymentData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    load({ from: from || undefined, to: to || undefined });
  };

  const handleClearFilter = () => {
    setFrom('');
    setTo('');
    load();
  };

  const handleDownloadPdf = () => {
    if (!summary) return;
    generateSalesReportPdf({
      summary,
      byDay,
      topProducts,
      paymentMethods,
      range: { from: from || undefined, to: to || undefined },
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">Reportes</h2>
          <p className="text-muted mb-0">Desempeño de ventas de la tienda.</p>
        </div>
        <button className="btn btn-accent" onClick={handleDownloadPdf} disabled={loading || !summary}>
          <i className="bi bi-file-earmark-pdf me-2" />
          Descargar reporte en PDF
        </button>
      </div>

      <form className="beat-card p-3 mb-4 d-flex flex-wrap align-items-end gap-3" onSubmit={handleFilter}>
        <div>
          <label className="form-label small mb-1">Desde</label>
          <input type="date" className="form-control form-control-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="form-label small mb-1">Hasta</label>
          <input type="date" className="form-control form-control-sm" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button className="btn btn-sm btn-primary" type="submit">
          Filtrar
        </button>
        {(from || to) && (
          <button className="btn btn-sm btn-outline-secondary" type="button" onClick={handleClearFilter}>
            Ver todo
          </button>
        )}
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {summary && (
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <StatCard label="Ventas totales" value={String(summary.totalSales)} icon="bi-receipt" />
              </div>
              <div className="col-md-3">
                <StatCard label="Ingresos" value={formatCentsToMXN(summary.totalRevenueInCents)} icon="bi-cash-stack" accent />
              </div>
              <div className="col-md-3">
                <StatCard label="Descuentos otorgados" value={formatCentsToMXN(summary.totalDiscountInCents)} icon="bi-percent" />
              </div>
              <div className="col-md-3">
                <StatCard label="Reembolsado" value={formatCentsToMXN(summary.totalRefundedInCents)} icon="bi-arrow-return-left" accent />
              </div>
            </div>
          )}

          <div className="row g-3">
            <div className="col-lg-6">
              <div className="beat-card p-4">
                <h5 className="fw-bold mb-3">Ventas por día</h5>
                {byDay.length === 0 ? (
                  <p className="text-muted mb-0">Sin datos todavía.</p>
                ) : (
                  <table className="table table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Día</th>
                        <th>Ventas</th>
                        <th>Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byDay.map((d) => (
                        <tr key={d.date}>
                          <td>{d.date}</td>
                          <td>{d.totalSales}</td>
                          <td>{formatCentsToMXN(d.totalRevenueInCents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="beat-card p-4 mb-3">
                <h5 className="fw-bold mb-3">Productos más vendidos</h5>
                {topProducts.length === 0 ? (
                  <p className="text-muted mb-0">Sin datos todavía.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {topProducts.map((p) => (
                      <li key={p.productId} className="list-group-item d-flex justify-content-between px-0">
                        <span>{p.name}</span>
                        <span className="badge bg-accent">{p.quantitySold} vendidos</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="beat-card p-4">
                <h5 className="fw-bold mb-3">Métodos de pago</h5>
                {paymentMethods.length === 0 ? (
                  <p className="text-muted mb-0">Sin datos todavía.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {paymentMethods.map((m) => (
                      <li key={m.method} className="list-group-item d-flex justify-content-between px-0">
                        <span>{m.method === 'CASH' ? 'Efectivo' : 'Tarjeta'}</span>
                        <span className="fw-semibold">{formatCentsToMXN(m.totalInCents)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
