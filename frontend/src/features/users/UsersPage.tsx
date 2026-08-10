import React, { useEffect, useState } from 'react';
import { usersService } from './users.service';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { extractErrorMessage } from '../../utils/errors';
import type { AuthUser, UserRole } from '../../types/auth.types';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'CASHIER' as UserRole,
  employeeNumber: '',
};

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  CASHIER: 'Cajero',
  WAREHOUSE: 'Almacén',
};

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    usersService
      .findAll()
      .then(setUsers)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await usersService.create(form);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo crear el usuario'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: AuthUser) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await usersService.setStatus(user.id, newStatus);
    load();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1">Usuarios</h2>
          <p className="text-muted mb-0">Empleados con acceso al sistema.</p>
        </div>
        <button className="btn btn-accent" onClick={() => setShowForm((v) => !v)}>
          <i className="bi bi-person-plus me-1" /> Nuevo usuario
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
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                minLength={8}
                className="form-control"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Rol</label>
              <select
                className="form-select"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              >
                {Object.entries(ROLE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">No. de empleado</label>
              <input
                className="form-control"
                value={form.employeeNumber}
                onChange={(e) => setForm({ ...form, employeeNumber: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar usuario'}
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
                <th>Rol</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="fw-semibold">
                    {u.firstName} {u.lastName}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge bg-primary">{ROLE_LABEL[u.role]}</span>
                  </td>
                  <td>
                    <span className={`badge ${u.status === 'ACTIVE' ? 'bg-accent' : 'bg-secondary'}`}>
                      {u.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleToggleStatus(u)}>
                      {u.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
