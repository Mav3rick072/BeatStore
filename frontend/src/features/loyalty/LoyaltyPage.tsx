import React, { useEffect, useState } from 'react';
import { clientsService } from '../clients/clients.service';
import { loyaltyService } from './loyalty.service';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { extractErrorMessage } from '../../utils/errors';
import type { Client, LoyaltyAccount } from '../../types/domain.types';

export const LoyaltyPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState('');
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [points, setPoints] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientsService
      .findAll()
      .then(setClients)
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (id: string) => {
    setClientId(id);
    setAccount(null);
    if (!id) return;
    try {
      const data = await loyaltyService.getAccount(id);
      setAccount(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;
    setError(null);
    try {
      const updated = await loyaltyService.redeem(clientId, Number(points));
      setAccount(updated);
      setPoints('');
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo canjear los puntos'));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="fw-bold text-primary mb-4">Programa de fidelidad</h2>
      <ErrorAlert message={error} onClose={() => setError(null)} />

      <div className="beat-card p-4" style={{ maxWidth: 520 }}>
        <label className="form-label">Cliente</label>
        <select className="form-select mb-4" value={clientId} onChange={(e) => handleSelect(e.target.value)}>
          <option value="">Selecciona un cliente...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName}
            </option>
          ))}
        </select>

        {account && (
          <>
            <div className="beat-stat-card accent mb-4">
              <div className="stat-label">Puntos disponibles</div>
              <div className="stat-value">{account.points}</div>
            </div>

            <form onSubmit={handleRedeem} className="d-flex gap-2">
              <input
                type="number"
                min={1}
                max={account.points}
                className="form-control"
                placeholder="Puntos a canjear"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                required
              />
              <button className="btn btn-primary" type="submit">
                Canjear
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
