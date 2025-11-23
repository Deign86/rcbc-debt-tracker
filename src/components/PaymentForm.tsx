import { useState } from 'react';
import type { PaymentCalculation } from '../types/debt';

interface PaymentFormProps {
  onCalculate: (amount: number) => PaymentCalculation;
  onSubmit: (amount: number, calculation: PaymentCalculation) => void;
}

export const PaymentForm = ({ onCalculate, onSubmit }: PaymentFormProps) => {
  const [amount, setAmount] = useState('');
  const [calculation, setCalculation] = useState<PaymentCalculation | null>(null);

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitized = value.replace(/[^\d.]/g, '');

    // Prevent multiple decimal points
    const parts = sanitized.split('.');
    const formatted = parts.length > 2
      ? `${parts[0]}.${parts.slice(1).join('')}`
      : sanitized;

    setAmount(formatted);

    // Calculate preview if valid amount
    const numValue = parseFloat(formatted);
    if (!isNaN(numValue) && numValue > 0) {
      const calc = onCalculate(numValue);
      setCalculation(calc);
    } else {
      setCalculation(null);
    }
  };

  const handleSubmit = () => {
    const numValue = parseFloat(amount);
    if (!isNaN(numValue) && numValue > 0 && calculation) {
      onSubmit(numValue, calculation);
      setAmount('');
      setCalculation(null);
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000];

  return (
    <div className="bg-cream-50 dark:bg-matcha-800 rounded-2xl shadow-md p-6 mx-4 mt-6 border-2 border-matcha-300 dark:border-matcha-600">
      <h2 className="text-lg font-bold text-matcha-900 dark:text-cream-50 mb-4">Log Payment</h2>

      {/* Payment Input */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-matcha-900 dark:text-cream-50 mb-2">
          Payment Amount
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
          />
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {quickAmounts.map((quickAmount) => (
          <button
            key={quickAmount}
            onClick={() => handleAmountChange(quickAmount.toString())}
            className="py-2 px-3 bg-matcha-100 dark:bg-matcha-700 hover:bg-matcha-200 dark:hover:bg-matcha-600 active:bg-matcha-300 dark:active:bg-matcha-500 rounded-lg text-sm font-semibold text-matcha-900 dark:text-cream-50 transition-colors"
          >
            ₱{quickAmount}
          </button>
        ))}
      </div>

      {/* Payment Preview */}
      {calculation && (
        <div className="bg-matcha-50 dark:bg-matcha-900 rounded-xl p-4 mb-4 space-y-2 border-2 border-matcha-300 dark:border-matcha-700">
          <div className="flex justify-between text-sm">
            <span className="text-matcha-800 dark:text-cream-200 font-medium">Interest Payment</span>
            <span className="font-semibold text-red-600">
              ₱{calculation.interest.toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-matcha-800 dark:text-cream-200 font-medium">Principal Payment</span>
            <span className="font-semibold text-green-600">
              ₱{calculation.principal.toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
          <div className="pt-2 border-t border-matcha-300 dark:border-matcha-700">
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-matcha-900 dark:text-cream-50">New Balance</span>
              <span className="text-lg font-bold text-matcha-900 dark:text-cream-50">
                ₱{calculation.remainingBalance.toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!calculation || !amount}
        className="w-full py-4 bg-matcha-600 hover:bg-matcha-700 active:bg-matcha-800 disabled:bg-cream-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-md"
      >
        Record Payment
      </button>
    </div>
  );
};
