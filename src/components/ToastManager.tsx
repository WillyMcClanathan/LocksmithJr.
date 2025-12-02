import { useState, useCallback, useEffect } from 'react';
import Toast, { ToastType } from './Toast';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
let showToastFn: ((message: string, type: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = 'info') {
  if (showToastFn) {
    showToastFn(message, type);
  }
}

export default function ToastManager() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = toastId++;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    showToastFn = addToast;

    const handleOnline = () => {
      addToast('Back online', 'online');
    };

    const handleOffline = () => {
      addToast('No internet connection', 'offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      showToastFn = null;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addToast]);

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}
