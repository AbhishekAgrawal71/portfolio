import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './ConfirmModal.css';

export const ConfirmModal = ({ isOpen, title, message, confirmText = 'Delete', onConfirm, onCancel, isDanger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal__header">
          <div className={`confirm-modal__icon ${isDanger ? 'confirm-modal__icon--danger' : ''}`}>
            <AlertTriangle size={24} />
          </div>
          <h3 className="confirm-modal__title">{title || 'Confirm Action'}</h3>
        </div>

        <div className="confirm-modal__body">
          <p>{message || 'Are you sure you want to proceed? This action cannot be undone.'}</p>
        </div>

        <div className="confirm-modal__footer">
          <button type="button" className="admin-btn admin-btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`admin-btn ${isDanger ? 'admin-btn--danger' : 'admin-btn--primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
