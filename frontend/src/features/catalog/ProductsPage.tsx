import React, { useEffect, useState } from 'react';
import { catalogService } from './catalog.service';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { formatCentsToMXN, pesosToCents } from '../../utils/money';
import { extractErrorMessage } from '../../utils/errors';
import { useAuth } from '../../context/AuthContext';
import type { Category, Product } from '../../types/catalog.types';

const emptyForm = {
  name: '',
  sku: '',
  barcode: '',
  categoryId: '',
  priceInCents: '',
  initialStock: '',
  minStock: '',
  isRentable: false,
  rentalPriceInCents: '',
};

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'WAREHOUSE';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [showTaxonomyForm, setShowTaxonomyForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [taxonomySaving, setTaxonomySaving] = useState(false);

  const load = async (q?: string) => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        catalogService.searchProducts({ q }),
        catalogService.listCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo cargar el catálogo'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search);
  };

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '—';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await catalogService.createProduct({
        name: form.name,
        sku: form.sku,
        barcode: form.barcode || undefined,
        categoryId: form.categoryId,
        priceInCents: pesosToCents(Number(form.priceInCents)),
        initialStock: Number(form.initialStock || 0),
        minStock: Number(form.minStock || 0),
        isRentable: form.isRentable,
        rentalPriceInCents: form.isRentable
          ? pesosToCents(Number(form.rentalPriceInCents || 0))
          : undefined,
      });
      setForm(emptyForm);
      setShowForm(false);
      load(search);
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo crear el producto'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setTaxonomySaving(true);
    setError(null);
    try {
      await catalogService.createCategory({ name: newCategoryName.trim() });
      setNewCategoryName('');
      load(search);
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo crear la categoría'));
    } finally {
      setTaxonomySaving(false);
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    setTaxonomySaving(true);
    setError(null);
    try {
      await catalogService.createBrand({ name: newBrandName.trim() });
      setNewBrandName('');
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo crear la marca'));
    } finally {
      setTaxonomySaving(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">Productos</h2>
          <p className="text-muted mb-0">Catálogo de instrumentos y accesorios musicales.</p>
        </div>
        {canManage && (
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={() => setShowTaxonomyForm((v) => !v)}
            >
              <i className="bi bi-tags me-1" /> Categorías / marcas
            </button>
            <button className="btn btn-accent" onClick={() => setShowForm((v) => !v)}>
              <i className="bi bi-plus-lg me-1" /> Nuevo producto
            </button>
          </div>
        )}
      </div>

      <ErrorAlert message={error} onClose={() => setError(null)} />

      {showTaxonomyForm && (
        <div className="beat-card p-4 mb-4">
          <h6 className="fw-bold mb-3">Categorías y marcas</h6>
          <div className="row g-4">
            <div className="col-md-6">
              <form className="d-flex gap-2 mb-3" onSubmit={handleCreateCategory}>
                <input
                  className="form-control"
                  placeholder="Nueva categoría (ej. Vientos)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button className="btn btn-primary" type="submit" disabled={taxonomySaving}>
                  Agregar
                </button>
              </form>
              <div className="d-flex flex-wrap gap-2">
                {categories.map((c) => (
                  <span key={c.id} className="badge bg-primary">
                    {c.name}
                  </span>
                ))}
                {categories.length === 0 && <span className="text-muted small">Sin categorías aún.</span>}
              </div>
            </div>
            <div className="col-md-6">
              <form className="d-flex gap-2 mb-3" onSubmit={handleCreateBrand}>
                <input
                  className="form-control"
                  placeholder="Nueva marca (ej. Roland)"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                />
                <button className="btn btn-primary" type="submit" disabled={taxonomySaving}>
                  Agregar
                </button>
              </form>
              <p className="text-muted small mb-0">
                Las marcas nuevas estarán disponibles al crear productos después de recargar la lista.
              </p>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form className="beat-card p-4 mb-4" onSubmit={handleCreate}>
          <h6 className="fw-bold mb-3">Nuevo producto</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Nombre</label>
              <input
                className="form-control"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">SKU</label>
              <input
                className="form-control"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Código de barras</label>
              <input
                className="form-control"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Categoría</label>
              <select
                className="form-select"
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">Elige...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Precio (MXN)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                required
                value={form.priceInCents}
                onChange={(e) => setForm({ ...form, priceInCents: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Stock inicial</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={form.initialStock}
                onChange={(e) => setForm({ ...form, initialStock: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Stock mínimo</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isRentable"
                  checked={form.isRentable}
                  onChange={(e) => setForm({ ...form, isRentable: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="isRentable">
                  Alquilable
                </label>
              </div>
            </div>
            {form.isRentable && (
              <div className="col-md-2">
                <label className="form-label">Precio de alquiler/día</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  value={form.rentalPriceInCents}
                  onChange={(e) => setForm({ ...form, rentalPriceInCents: e.target.value })}
                />
              </div>
            )}
          </div>
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar producto'}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <form className="mb-3" onSubmit={handleSearch}>
        <div className="input-group" style={{ maxWidth: 420 }}>
          <span className="input-group-text bg-white">
            <i className="bi bi-search" />
          </span>
          <input
            className="form-control"
            placeholder="Buscar por nombre, SKU o código de barras..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-outline-primary" type="submit">
            Buscar
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="beat-card p-0">
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Alquilable</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-semibold">{p.name}</td>
                    <td>
                      <code>{p.sku}</code>
                    </td>
                    <td>{categoryName(p.categoryId)}</td>
                    <td>{formatCentsToMXN(p.priceInCents)}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.stock.quantity <= p.stock.minStock ? 'bg-danger' : 'bg-accent'
                        }`}
                      >
                        {p.stock.quantity - p.stock.reserved} disponibles
                      </span>
                    </td>
                    <td>
                      {p.isRentable ? (
                        <span className="badge bg-primary">
                          {formatCentsToMXN(p.rentalPriceInCents ?? 0)}/día
                        </span>
                      ) : (
                        <span className="text-muted">No</span>
                      )}
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No se encontraron productos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
