import { useState } from 'react';
import { useDebtCalculator } from '../hooks/useDebtCalculator';

const INITIAL_DEBT = 50249.75;

export const Simulator = () => {
  const [monthlyPayment, setMonthlyPayment] = useState('5000');
  const [showSchedule, setShowSchedule] = useState(false);

  const { simulatePayments } = useDebtCalculator({
    currentPrincipal: INITIAL_DEBT,
    interestRate: 0.035,
    minimumPayment: INITIAL_DEBT * 0.05,
    statementDate: new Date(),
    dueDate: new Date(),
  });

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^\d.]/g, '');
    setMonthlyPayment(sanitized);
    setShowSchedule(false);
  };

  const handleSimulate = () => {
    const amount = parseFloat(monthlyPayment);
    if (!isNaN(amount) && amount > 0) {
      setShowSchedule(true);
    }
  };

  const schedule = showSchedule
    ? simulatePayments(parseFloat(monthlyPayment))
    : [];

  const totalInterest = schedule.reduce((sum, month) => sum + month.interest, 0);
  const totalPaid = schedule.reduce((sum, month) => sum + month.payment, 0);
  const monthsToPayoff = schedule.length;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-cream-50 dark:bg-matcha-800 shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-matcha-900 dark:text-cream-50">Payment Simulator</h1>
          <p className="text-sm text-matcha-600 dark:text-cream-200 mt-1">
            Plan your repayment strategy
          </p>
        </div>
      </div>

      {/* Simulator Input */}
      <div className="bg-cream-50 dark:bg-matcha-800 rounded-2xl shadow-md p-6 mx-4 mt-6 border border-transparent dark:border-cream-200/10">
        <h2 className="text-lg font-semibold text-matcha-900 dark:text-cream-50 mb-4">
          Monthly Payment Amount
        </h2>

        <div className="mb-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-matcha-600 dark:text-matcha-400 text-lg">
              ₱
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={monthlyPayment}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="5000.00"
              className="w-full pl-10 pr-4 py-4 text-2xl font-semibold border-2 border-matcha-200 dark:border-matcha-600/20 bg-white dark:bg-matcha-800 text-matcha-900 dark:text-cream-50 placeholder-matcha-400 dark:placeholder-matcha-600 rounded-xl focus:border-matcha-500 dark:focus:border-matcha-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Quick Amounts */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[3000, 5000, 10000].map((amount) => (
            <button
              key={amount}
              onClick={() => {
                setMonthlyPayment(amount.toString());
                setShowSchedule(false);
              }}
              className="py-2 bg-matcha-100 dark:bg-matcha-700/30 hover:bg-matcha-200 dark:hover:bg-matcha-700/50 active:bg-matcha-300 dark:active:bg-matcha-700/70 rounded-lg text-sm font-medium text-matcha-800 dark:text-cream-100 transition-colors"
            >
              ₱{amount.toLocaleString()}
            </button>
          ))}
        </div>

        <button
          onClick={handleSimulate}
          disabled={!monthlyPayment || parseFloat(monthlyPayment) <= 0}
          className="w-full py-4 bg-matcha-600 hover:bg-matcha-700 active:bg-matcha-800 disabled:bg-matcha-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-md"
        >
          Calculate Payoff Timeline
        </button>
      </div>

      {/* Results Summary */}
      {showSchedule && schedule.length > 0 && (
        <>
          <div className="mx-4 mt-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg text-white">
              <h3 className="text-sm font-medium opacity-90 mb-4">
                Payoff Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs opacity-75 mb-1">Time to Payoff</p>
                  <p className="text-3xl font-bold">
                    {monthsToPayoff} {monthsToPayoff === 1 ? 'month' : 'months'}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-75 mb-1">Total Interest</p>
                  <p className="text-3xl font-bold">
                    ₱{totalInterest.toLocaleString('en-PH', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex justify-between items-center">
                  <p className="text-sm opacity-90">Total Amount Paid</p>
                  <p className="text-xl font-bold">
                    ₱{totalPaid.toLocaleString('en-PH', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Schedule */}
          <div className="mx-4 mt-6 mb-6">
            <h3 className="text-lg font-semibold text-matcha-900 dark:text-cream-50 mb-3">
              Payment Schedule
            </h3>
            <div className="bg-cream-50 dark:bg-matcha-800 rounded-xl shadow-md overflow-hidden border border-transparent dark:border-cream-200/10">
              <div className="max-h-96 overflow-y-auto">
                {schedule.map((month) => (
                  <div
                    key={month.month}
                    className="p-4 border-b border-matcha-100 dark:border-matcha-700 last:border-b-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-matcha-900 dark:text-cream-100">
                          Month {month.month}
                        </p>
                        <div className="mt-1 space-y-0.5">
                          <p className="text-xs text-matcha-600 dark:text-matcha-400">
                            Interest: ₱{month.interest.toFixed(2)}
                          </p>
                          <p className="text-xs text-matcha-600 dark:text-matcha-400">
                            Principal: ₱{month.principal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-matcha-900 dark:text-cream-100">
                          ₱{month.balance.toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-matcha-600 dark:text-matcha-400 mt-1">
                          remaining
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Warning for low payments */}
      {showSchedule && schedule.length >= 60 && (
        <div className="mx-4 mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ This payment amount will take over 5 years to pay off. Consider increasing your monthly payment to reduce interest charges.
          </p>
        </div>
      )}
    </div>
  );
};
