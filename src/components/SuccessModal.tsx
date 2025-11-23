interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const SuccessModal = ({ isOpen, title, message, onClose }: SuccessModalProps) => {
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
        <div className="bg-cream-50 dark:bg-matcha-800 rounded-2xl shadow-2xl max-w-sm w-full border-2 border-matcha-300 dark:border-matcha-600 animate-scale-in">
          {/* Success Icon */}
          <div className="flex justify-center pt-8 pb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 text-center">
            <h2 className="text-xl font-bold text-matcha-900 dark:text-cream-50 mb-2">
              {title}
            </h2>
            <p className="text-sm text-matcha-700 dark:text-cream-200 mb-6 font-medium">
              {message}
            </p>

            {/* Action Button */}
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-matcha-600 hover:bg-matcha-700 active:bg-matcha-800 text-white font-semibold rounded-xl transition-colors shadow-md"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
