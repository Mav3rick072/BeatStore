import React from 'react';

export const ErrorAlert: React.FC<{ message: string | null; onClose?: () => void }> = ({
  message,
  onClose,
}) => {
  if (!message) return null;
  return (
    <div className="alert alert-danger d-flex align-items-center justify-content-between" role="alert">
      <span>
        <i className="bi bi-exclamation-triangle-fill me-2" />
        {message}
      </span>
      {onClose && (
        <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
      )}
    </div>
  );
};
