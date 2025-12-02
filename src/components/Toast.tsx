import { useEffect, useState } from 'react';
import { Wifi, WifiOff, CheckCircle, Info, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'online' | 'offline';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
      case 'warning':
        return <AlertCircle size={20} />;
      case 'online':
        return <Wifi size={20} />;
      case 'offline':
        return <WifiOff size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'online':
        return 'bg-green-500 text-white';
      case 'offline':
        return 'bg-gray-700 dark:bg-gray-600 text-white';
      default:
        return 'bg-gray-900 dark:bg-gray-700 text-white';
    }
  };

  return (
    <div
      className={`fixed top-20 left-4 right-4 mx-auto max-w-sm z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div className={`${getStyles()} rounded-2xl px-4 py-3 elevation-4 flex items-center gap-3`}>
        <div className="flex-shrink-0">{getIcon()}</div>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 touch-target flex items-center justify-center -mr-2"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
