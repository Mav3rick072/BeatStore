import React, { useState } from 'react';
import { productosMock } from './sales.data';
import type { Producto } from './sales.data';

interface CartItem extends Producto {
  cantidad: number;
}

export const SalesView: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = productosMock.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Producto) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prevCart, { ...product, cantidad: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    alert('¡Venta realizada con éxito! (Simulación POS)');
    setCart([]);
  };

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-md-12">
          <h2 className="fw-bold text-dark">Módulo de Ventas (POS)</h2>
          <p className="text-muted">Selecciona los productos musicales para agregarlos a la orden de cobro.</p>
        </div>
      </div>

      <div className="row">
        {/* Catálogo de Productos */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 mb-4 p-3">
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Buscar producto por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="row g-3">
              {filteredProducts.map((product) => (
                <div className="col-md-6" key={product.id}>
                  <div className="card h-100 border shadow-none p-3 d-flex flex-column justify-content-between">
                    <div>
                      <span className="badge bg-secondary mb-2">{product.categoria}</span>
                      <h5 className="card-title fs-6 fw-bold">{product.nombre}</h5>
                      <p className="text-success fw-bold mb-1">${product.precio.toFixed(2)}</p>
                      <small className="text-muted">Stock disponible: {product.stock}</small>
                    </div>
                    <button
                      className="btn btn-outline-primary btn-sm mt-3 w-100"
                      onClick={() => addToCart(product)}
                    >
                      Agregar al Carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen del Carrito / Cobro */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 p-4">
            <h4 className="fw-bold mb-3">Orden Actual</h4>
            {cart.length === 0 ? (
              <p className="text-muted text-center py-4">El carrito está vacío.</p>
            ) : (
              <>
                <ul className="list-group mb-3">
                  {cart.map((item) => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="my-0 fs-6">{item.nombre}</h6>
                        <small className="text-muted">${item.precio} x {item.cantidad}</small>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold">${(item.precio * item.cantidad).toFixed(2)}</span>
                        <button
                          className="btn btn-sm btn-outline-danger py-0 px-1"
                          onClick={() => removeFromCart(item.id)}
                        >
                          &times;
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="d-flex justify-content-between fs-5 fw-bold mb-4">
                  <span>Total a Pagar:</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>

                <button className="btn btn-primary w-100 py-2 fw-bold" onClick={handleCheckout}>
                  Completar Venta / Cobrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};