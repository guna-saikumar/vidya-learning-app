import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext({
  showToast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
});

let globalShowToast = null;

export const toast = {
  show: (msg, opts) => globalShowToast?.(msg, opts),
  success: (title, message) => globalShowToast?.(title, { message, type: 'success' }),
  error: (title, message) => globalShowToast?.(title, { message, type: 'error' }),
  info: (title, message) => globalShowToast?.(title, { message, type: 'info' }),
  warning: (title, message) => globalShowToast?.(title, { message, type: 'warning' }),
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title, options = {}) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newToast = {
      id,
      title: typeof title === 'string' ? title : title?.title,
      message: options.message || (typeof title === 'object' ? title.message : ''),
      type: options.type || (typeof title === 'object' ? title.type : 'info') || 'info',
      duration: options.duration ?? 3500,
    };

    setToasts((prev) => [...prev.slice(-3), newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, [removeToast]);

  useEffect(() => {
    globalShowToast = showToast;
    return () => {
      globalShowToast = null;
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="vidya-toast-container">
        {toasts.map((t) => {
          const isError = t.type === 'error';
          const isSuccess = t.type === 'success';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className={`vidya-toast vidya-toast-${t.type}`}
              role="alert"
            >
              <div className="vidya-toast-icon">
                {isError && <AlertCircle size={20} />}
                {isSuccess && <CheckCircle2 size={20} />}
                {isWarning && <AlertTriangle size={20} />}
                {!isError && !isSuccess && !isWarning && <Info size={20} />}
              </div>
              <div className="vidya-toast-body">
                <div className="vidya-toast-title">{t.title}</div>
                {t.message && <div className="vidya-toast-message">{t.message}</div>}
              </div>
              <button
                type="button"
                className="vidya-toast-close"
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss toast"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
