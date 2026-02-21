'use client';

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  actions?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  actions,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="card border-accent animate-fadeUp">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[color:var(--color-border)]">
            <h2 className="text-lg font-mono font-bold text-text-primary">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            {children}
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex gap-3 border-t border-[color:var(--color-border)] pt-4">
              {actions}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Modal;
