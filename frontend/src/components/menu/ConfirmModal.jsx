import { useEffect } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// ─── ConfirmModal — General reusable confirm dialog ───────────────────────────
// Props:
//   isOpen      : bool
//   onClose     : () => void
//   onConfirm   : () => void
//   title       : string
//   message     : string
//   confirmText : string  (default: "Confirm")
//   cancelText  : string  (default: "Cancel")
//   variant     : "primary" | "danger"  (default: "primary")
//   loading     : bool   — disables buttons while loading
//   icon        : ReactNode (optional custom icon)

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title       = 'Are you sure?',
  message     = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText  = 'Cancel',
  variant     = 'primary',
  loading     = false,
  icon,
}) => {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  const confirmBtn = isDanger
    ? 'bg-red-500 hover:bg-red-600 active:bg-red-700 shadow-lg shadow-red-200 dark:shadow-red-900/30'
    : 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 shadow-lg shadow-primary-200 dark:shadow-primary-900/30';

  const iconBg = isDanger
    ? 'bg-red-50 dark:bg-red-900/20'
    : 'bg-primary-50 dark:bg-primary-900/20';

  const iconColor = isDanger
    ? 'text-red-500'
    : 'text-primary-500';

  const DefaultIcon = isDanger ? ExclamationTriangleIcon : CheckCircleIcon;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-in"
          style={{ animation: 'modalIn 0.2s ease-out' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center mx-auto mb-5`}>
              {icon ?? <DefaultIcon className={`w-8 h-8 ${iconColor}`} />}
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {title}
            </h2>

            {/* Message */}
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed">
              {message}
            </p>

            {/* Actions */}
            <div className="flex gap-3 mt-7">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${confirmBtn}`}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Processing...
                  </>
                ) : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </>
  );
};

export default ConfirmModal;