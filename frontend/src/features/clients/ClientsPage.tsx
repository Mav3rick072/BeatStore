import React, { useEffect, useState } from 'react';
import { clientsService } from './clients.service';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { extractErrorMessage } from '../../utils/errors';
import type { Client } from '../../types/domain.types';

const emptyForm = { firstName: '', lastName: '', email: '', phone: '' };

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editSaving, setEditSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    clientsService
      .findAll()
      .then(setClients)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await clientsService.create(form);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo crear el cliente'));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (client: Client) => {
    setEditingId(client.id);
    setEditForm({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email ?? '',
      phone: client.phone ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const handleUpdate = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setEditSaving(true);
    setError(null);
    try {
      await clientsService.update(id, editForm);
      cancelEdit();
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo actualizar el cliente'));
    } finally {
      setEditSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('¿Desactivar este cliente? No aparecerá en las listas activas.')) return;
    setRemovingId(id);
    setError(null);
    try {
      await clientsService.remove(id);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo desactivar el cliente'));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">Clientes</h2>
          <p className="text-muted mb-0">Clientes registrados y su información de contacto.</p>
        </div>
        <button
          className="btn btn-accent"
          onClick={() => {
            cancelEdit();
            setShowForm((v) => !v);
          }}
        >
          <i className="bi bi-person-plus me-1" /> Nuevo cliente
        </button>
      </div>

      <ErrorAlert message={error} onClose={() => setError(null)} />

      {showForm && (
        <form className="beat-card p-4 mb-4" onSubmit={handleCreate}>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Nombre</label>
              <input
                className="form-control"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Apellido</label>
              <input
                className="form-control"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Correo</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Teléfono</label>
              <input
                className="form-control"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cliente'}
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
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th style={{ width: 220 }}></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) =>
                editingId === c.id ? (
                  <tr key={c.id}>
                    <td colSpan={4}>
                      <form className="d-flex flex-wrap gap-2 align-items-end py-2" onSubmit={(e) => handleUpdate(e, c.id)}>
                        <div>
                          <label className="form-label small mb-0">Nombre</label>
                          <input
                            className="form-control form-control-sm"
                            required
                            value={editForm.firstName}
                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="form-label small mb-0">Apellido</label>
                          <input
                            className="form-control form-control-sm"
                            required
                            value={editForm.lastName}
                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="form-label small mb-0">Correo</label>
                          <input
                            type="email"
                            className="form-control form-control-sm"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="form-label small mb-0">Teléfono</label>
                          <input
                            className="form-control form-control-sm"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          />
                        </div>
                        <button className="btn btn-sm btn-primary" type="submit" disabled={editSaving}>
                          {editSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={cancelEdit}>
                          Cancelar
                        </button>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={c.id}>
                    <td className="fw-semibold">
                      {c.firstName} {c.lastName}
                    </td>
                    <td>{c.email || '—'}</td>
                    <td>{c.phone || '—'}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(c)}>
                          <i className="bi bi-pencil" /> Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={removingId === c.id}
                          onClick={() => handleRemove(c.id)}
                        >
                          <i className="bi bi-trash" /> {removingId === c.id ? 'Desactivando...' : 'Desactivar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    No hay clientes registrados.
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
