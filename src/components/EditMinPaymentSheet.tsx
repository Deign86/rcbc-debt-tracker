import { useState, useEffect } from 'react';

interface EditMinPaymentSheetProps {
  isOpen: boolean;
  currentMinPayment: number;
  onClose: () => void;
  onSave: (newMinPayment: number) => void;
}

export const EditMinPaymentSheet = ({
  isOpen,
  currentMinPayment,
  onClose,
  onSave
}: EditMinPaymentSheetProps) => {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount(currentMinPayment.toString());
    }
  }, [isOpen, currentMinPayment]);

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^\d.]/g, '');
    const parts = sanitized.split('.');
    const formatted = parts.length > 2
      ? `${parts[0]}.${parts.slice(1).join('')}`
      : sanitized;
    setAmount(formatted);
  };

  const handleSave = () => {
    const numValue = parseFloat(amount);
    if (!isNaN(numValue) && numValue > 0) {
      onSave(numValue);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-matcha-900/50 dark:bg-black/70 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream-50 dark:bg-matcha-800 rounded-t-3xl z-50 shadow-2xl animate-slide-up border-t-2 border-matcha-300 dark:border-matcha-600">
        <div className="max-w-2xl mx-auto">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-matcha-300 dark:bg-matcha-600 rounded-full" />
          </div>

          <div className="p-6 pb-8">
            <h2 className="text-xl font-bold text-matcha-900 dark:text-cream-50 mb-2">
              Edit Minimum Payment
            </h2>
            <p className="text-sm text-matcha-700 dark:text-cream-200 mb-6 font-medium">
              Update the minimum payment amount for accurate calculations. This affects payment simulations.
            </p>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-matcha-800 dark:text-cream-100 mb-2">
                Minimum Payment Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-matcha-500 dark:text-matcha-400 text-lg">
                  ₱
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-4 text-2xl font-semibold border-2 border-matcha-300 dark:border-matcha-600 rounded-xl focus:border-matcha-500 dark:focus:border-matcha-400 focus:outline-none transition-colors bg-white dark:bg-matcha-900 text-matcha-900 dark:text-cream-50 placeholder-matcha-400 dark:placeholder-matcha-600"
                  autoFocus
                />
              </div>
              <p className="text-xs text-matcha-700 dark:text-cream-300 mt-2 font-medium">
                💡 RCBC calculates minimum as 5% of balance or ₱500, whichever is higher
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 border-2 border-matcha-400 dark:border-matcha-600 text-matcha-800 dark:text-cream-100 font-semibold rounded-xl hover:bg-matcha-50 dark:hover:bg-matcha-900 active:bg-matcha-100 dark:active:bg-matcha-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-matcha-600 hover:bg-matcha-700 active:bg-matcha-800 text-white font-semibold rounded-xl transition-colors shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
