import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-white border border-zinc-200 rounded-2xl shadow-xl text-zinc-900">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors p-1 rounded-lg hover:bg-zinc-100"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl shrink-0 ${
              isDestructive
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-zinc-100 text-black border border-zinc-200'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-black">{title}</h3>
            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-zinc-800 hover:text-black bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors border border-zinc-200 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                : 'bg-black hover:bg-zinc-800'
            }`}
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
