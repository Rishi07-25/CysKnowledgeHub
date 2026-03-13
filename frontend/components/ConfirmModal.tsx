import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  isLoading = false,
}) => {

  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'text-red-400',
      iconBg: isLight ? 'bg-red-100 border-red-300' : 'bg-red-900/30 border-red-700/40',
      button: isLight ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-red-600 hover:bg-red-500',
      border: isLight ? 'border-red-300' : 'border-red-500/30',
    },
    warning: {
      icon: 'text-yellow-400',
      iconBg: isLight ? 'bg-yellow-100 border-yellow-300' : 'bg-yellow-900/30 border-yellow-700/40',
      button: isLight ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 'bg-yellow-600 hover:bg-yellow-500',
      border: isLight ? 'border-yellow-300' : 'border-yellow-500/30',
    },
    info: {
      icon: 'text-cyan-400',
      iconBg: isLight ? 'bg-cyan-100 border-cyan-300' : 'bg-cyan-900/30 border-cyan-700/40',
      button: isLight ? 'bg-cyan-400 hover:bg-cyan-500 text-black' : 'bg-cyan-600 hover:bg-cyan-500',
      border: isLight ? 'border-cyan-300' : 'border-cyan-500/30',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 ${isLight ? 'bg-black/30' : 'bg-black/70'} backdrop-blur-sm animate-fade-in`}>
      <div className={`${isLight ? 'bg-white' : 'bg-gray-950'} border ${styles.border} rounded-2xl w-full max-w-md shadow-2xl animate-scale-in`}>
        {/* Header */}
        <div className={`flex items-start justify-between p-6 border-b ${isLight ? 'border-gray-200' : 'border-gray-800'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${styles.iconBg}`}>
              <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
            </div>
            <h3 className={`text-lg font-bold ${isLight ? 'text-black' : 'text-white'}`}>{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`p-1.5 ${isLight ? 'text-gray-400 hover:text-black hover:bg-gray-200' : 'text-gray-400 hover:text-white hover:bg-gray-800'} rounded-lg transition-colors disabled:opacity-50`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className={`${isLight ? 'text-gray-700' : 'text-gray-300'} leading-relaxed whitespace-pre-line`}>{message}</p>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 p-6 border-t ${isLight ? 'border-gray-200 bg-gray-100' : 'border-gray-800 bg-gray-900/50'}`}>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`px-4 py-2 ${isLight ? 'bg-gray-200 hover:bg-gray-300 border-gray-300 text-black' : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-white'} rounded-xl text-sm font-semibold transition-colors disabled:opacity-50`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 ${styles.button} rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 min-w-[100px]`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className={`w-4 h-4 border-2 ${isLight ? 'border-black/30 border-t-black' : 'border-white/30 border-t-white'} rounded-full animate-spin`} />
                Loading...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
