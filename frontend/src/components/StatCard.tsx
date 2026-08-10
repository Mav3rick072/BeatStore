import React from 'react';

export const StatCard: React.FC<{
  label: string;
  value: string;
  icon: string;
  accent?: boolean;
}> = ({ label, value, icon, accent }) => (
  <div className={`beat-stat-card${accent ? ' accent' : ''} h-100`}>
    <div className="d-flex justify-content-between align-items-start">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
      <i className={`bi ${icon} fs-2 opacity-75`} />
    </div>
  </div>
);
