interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetModal = ({ isOpen, onClose, onConfirm }: ResetModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-cream-50 dark:bg-matcha-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-matcha-300 dark:border-matcha-600 animate-scale-in">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-matcha-200 dark:border-matcha-700">
            <h2 className="text-2xl font-bold text-matcha-900 dark:text-cream-50">
              Reset All Data
            </h2>
            <p className="text-sm text-matcha-700 dark:text-cream-200 mt-1 font-medium">
              Are you sure you want to reset all data?
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-3">
                ⚠️ This action cannot be undone!
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                This will permanently:
              </p>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3 text-matcha-800 dark:text-cream-100">
                <span className="text-lg">🗑️</span>
                <p className="text-sm font-medium pt-0.5">Delete all payment history</p>
              </div>
              <div className="flex items-start gap-3 text-matcha-800 dark:text-cream-100">
                <span className="text-lg">↩️</span>
                <p className="text-sm font-medium pt-0.5">Reset debt to initial amount</p>
              </div>
              <div className="flex items-start gap-3 text-matcha-800 dark:text-cream-100">
                <span className="text-lg">✏️</span>
                <p className="text-sm font-medium pt-0.5">Clear all adjustments</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border-2 border-matcha-400 dark:border-matcha-600 text-matcha-800 dark:text-cream-100 font-semibold rounded-xl hover:bg-matcha-50 dark:hover:bg-matcha-900 active:bg-matcha-100 dark:active:bg-matcha-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold rounded-xl transition-colors shadow-md"
            >
              Reset All Data
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
