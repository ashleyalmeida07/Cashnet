'use client';

import React, { useEffect } from 'react';
import { useUIStore, type Toast as ToastType } from '@/store/uiStore';

interface ToastProps extends ToastType {}

const Toast: React.FC<ToastProps & { onDismiss: () => void }> = ({
  id,
  message,
  severity,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const severityStyles = {
    info: 'bg-[rgba(0,212,255,0.1)] border-[#00d4ff] text-[#00d4ff]',
    success: 'bg-[rgba(0,212,99,0.1)] border-[#00d463] text-[#00d463]',
    warning: 'bg-[rgba(255,182,68,0.1)] border-[#ffb644] text-[#ffb644]',
    error: 'bg-[rgba(255,56,96,0.1)] border-[#ff3860] text-[#ff3860]',
  };

  return (
    <div
      className={`
        fixed bottom-4 right-4 p-4 rounded border backdrop-blur-sm
        font-mono text-sm animate-toastIn
        ${severityStyles[severity]}
      `}
      role="alert"
    >
      <div className="flex items-center justify-between gap-3">
        <span>{message}</span>
        <button
          onClick={onDismiss}
          className="text-current hover:opacity-70 transition-opacity"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-2 pointer-events-none z-50">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            {...toast}
            onDismiss={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default Toast;
