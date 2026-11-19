import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const { type = 'success', message } = toast;

  return (
    <div className={`admin-toast admin-toast--${type}`}>
      <div className="admin-toast__icon">
        {type === 'success' && <CheckCircle2 size={18} />}
        {type === 'error' && <AlertCircle size={18} />}
        {type === 'info' && <Info size={18} />}
      </div>
      <div className="admin-toast__message">{message}</div>
      <button className="admin-toast__close" onClick={onClose} aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
