import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTheme } from './ThemeContext';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const getToastConfig = (type: ToastType, isLight: boolean) => {
  const base = {
    success: {
      icon: CheckCircle2,
      colors: isLight
        ? 'bg-green-100 border-green-300 text-green-700'
        : 'bg-green-950/90 border-green-700/60 text-green-400',
      iconColor: isLight ? 'text-green-600' : 'text-green-400',
    },
    error: {
      icon: XCircle,
      colors: isLight
        ? 'bg-red-100 border-red-300 text-red-700'
        : 'bg-red-950/90 border-red-700/60 text-red-400',
      iconColor: isLight ? 'text-red-600' : 'text-red-400',
    },
    warning: {
      icon: AlertCircle,
      colors: isLight
        ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
        : 'bg-yellow-950/90 border-yellow-700/60 text-yellow-400',
      iconColor: isLight ? 'text-yellow-600' : 'text-yellow-400',
    },
    info: {
      icon: Info,
      colors: isLight
        ? 'bg-cyan-100 border-cyan-300 text-cyan-800'
        : 'bg-cyan-950/90 border-cyan-700/60 text-cyan-400',
      iconColor: isLight ? 'text-cyan-600' : 'text-cyan-400',
    },
  };
  return base[type];
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, type, message, duration };
    setToasts((prev) => [...prev, toast]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, duration = 3000) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message: string, duration = 4000) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration = 3500) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message: string, duration = 3000) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const config = getToastConfig(toast.type, isLight);
          const Icon = config.icon;
          return (
            <div
              key={toast.id}
              className={`
                pointer-events-auto flex items-center gap-3 min-w-[320px] max-w-md
                px-4 py-3 rounded-xl border backdrop-blur-sm shadow-2xl
                animate-slide-in-right ${config.colors}
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className={`p-1 ${isLight ? 'hover:bg-black/10' : 'hover:bg-white/10'} rounded-lg transition-colors`}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
