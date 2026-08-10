import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { catalogService } from '../catalog/catalog.service';
import { clientsService } from '../clients/clients.service';
import { cashRegisterService } from '../cash-register/cash-register.service';
import { salesService } from './sales.service';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { formatCentsToMXN } from '../../utils/money';
import { extractErrorMessage } from '../../utils/errors';
import type { Product } from '../../types/catalog.types';
import type { Client, CashRegisterSession } from '../../types/domain.types';
import type { PaymentMethod } from '../../types/sales.types';

interface CartItem {
  product: Product;
  quantity: number;
}

export const POSPage: React.FC = () => {
  const [register, setRegister] = useState<CashRegisterSession | null | 'loading'>('loading');
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientId, setClientId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cashRegisterService.isOpen().then(setRegister);
    catalogService.searchProducts({}).then(setProducts);
    clientsService.findAll().then(setClients).catch(() => setClients([]));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const results = await catalogService.searchProducts({ q: search });
    setProducts(results);
  };

  const addToCart = (product: Product) => {
    const available = product.stock.quantity - product.stock.reserved;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const currentQty = existing?.quantity ?? 0;
      if (currentQty + 1 > available) return prev;
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.product.id === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const total = cart.reduce((sum, item) => sum + item.product.priceInCents * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const sale = await salesService.create({
        clientId: clientId || undefined,
        items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        payments: [{ method: paymentMethod, amountInCents: total }],
      });
      setSuccessMessage(
        `Venta #${(sale.id ?? '').slice(-6).toUpperCase() || 'N/D'} registrada por ${formatCentsToMXN(sale.totalInCents)}.`,
      );
      setCart([]);
      setClientId('');
      catalogService.searchProducts({}).then(setProducts);
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo completar la venta'));
    } finally {
      setSubmitting(false);
    }
  };

  if (register === 'loading') return <LoadingSpinner />;

  if (!register) {
    return (
      <div className="beat-card p-5 text-center">
        <i className="bi bi-cash-coin display-4 text-primary mb-3 d-block" />
        <h4 className="fw-bold">No hay una caja abierta</h4>
        <p className="text-muted">Debes abrir la caja antes de registrar ventas.</p>
        <Link to="/caja" className="btn btn-accent">
          Ir a caja registradora
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="fw-bold text-primary mb-3">Punto de venta</h2>
      <ErrorAlert message={error} onClose={() => setError(null)} />
      {successMessage && (
        <div className="alert alert-success d-flex justify-content-between align-items-center">
          <span>
            <i className="bi bi-check-circle-fill me-2" />
            {successMessage}
          </span>
          <button className="btn-close" onClick={() => setSuccessMessage(null)} />
        </div>
      )}

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="beat-card p-3 mb-3">
            <form onSubmit={handleSearch} className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search" />
              </span>
              <input
                className="form-control"
                placeholder="Buscar producto por nombre, SKU o código de barras..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-outline-primary" type="submit">
                Buscar
              </button>
            </form>
          </div>

          <div className="row g-3">
            {products.map((product) => {
              const available = product.stock.quantity - product.stock.reserved;
              return (
                <div className="col-md-4" key={product.id}>
                  <div
                    className="beat-product-card p-3 h-100 d-flex flex-column justify-content-between"
                    onClick={() => available > 0 && addToCart(product)}
                  >
                    <div>
                      <h6 className="fw-bold mb-1">{product.name}</h6>
                      <div className="text-primary fw-bold mb-1">
                        {formatCentsToMXN(product.priceInCents)}
                      </div>
                      <small className={available > 0 ? 'text-muted' : 'text-danger'}>
                        {available > 0 ? `${available} disponibles` : 'Sin stock'}
                      </small>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-primary mt-3 w-100"
                      disabled={available <= 0}
                    >
                      <i className="bi bi-plus-lg me-1" /> Agregar
                    </button>
                  </div>
                </div>
              );
            })}
            {products.length === 0 && (
              <p className="text-muted">No se encontraron productos.</p>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="beat-card p-4">
            <h5 className="fw-bold mb-3">Orden actual</h5>

            {cart.length === 0 ? (
              <p className="text-muted text-center py-4">El carrito está vacío.</p>
            ) : (
              <div className="mb-3">
                {cart.map((item) => (
                  <div key={item.product.id} className="beat-cart-item py-2 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold small">{item.product.name}</div>
                      <div className="text-muted small">
                        {formatCentsToMXN(item.product.priceInCents)} c/u
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={item.product.stock.quantity - item.product.stock.reserved}
                        value={item.quantity}
                        className="form-control form-control-sm"
                        style={{ width: 60 }}
                        onChange={(e) => updateQuantity(item.product.id, Number(e.target.value))}
                      />
                      <span className="fw-bold small">
                        {formatCentsToMXN(item.product.priceInCents * item.quantity)}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label small">Cliente (opcional, para puntos de fidelidad)</label>
              <select className="form-select" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                <option value="">Venta general</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label small">Método de pago</label>
              <div className="btn-group w-100">
                <button
                  type="button"
                  className={`btn btn-sm ${paymentMethod === 'CASH' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setPaymentMethod('CASH')}
                >
                  <i className="bi bi-cash me-1" /> Efectivo
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${paymentMethod === 'CARD' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setPaymentMethod('CARD')}
                >
                  <i className="bi bi-credit-card me-1" /> Tarjeta
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-between fs-5 fw-bold mb-3">
              <span>Total:</span>
              <span className="text-primary">{formatCentsToMXN(total)}</span>
            </div>

            <button
              className="btn btn-accent w-100 py-2 fw-bold"
              disabled={cart.length === 0 || submitting}
              onClick={handleCheckout}
            >
              {submitting ? 'Procesando...' : 'Completar venta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
