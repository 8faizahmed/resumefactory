import React, { useEffect } from 'react';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface Props {
  toast: ToastMessage;
  onClose: () => void;
}

export const Toast = ({ toast, onClose }: Props) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Auto-dismiss after 3s
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const styles = {
    success: 'bg-gray-900 text-white border-l-4 border-green-500',
    error: 'bg-red-600 text-white border-l-4 border-red-800',
    info: 'bg-blue-600 text-white border-l-4 border-blue-800'
  };

  return (
    <div className={`fixed bottom-6 right-6 ${styles[toast.type]} px-6 py-4 rounded shadow-2xl z-50 flex items-center gap-3 min-w-[300px] animate-fade-in-up`}>
      <span className="text-lg">
        {toast.type === 'success' && '✅'}
        {toast.type === 'error' && '⚠️'}
        {toast.type === 'info' && 'ℹ️'}
      </span>
      <div className="flex-grow font-medium text-sm">{toast.message}</div>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 font-bold">✕</button>
    </div>
  );
};