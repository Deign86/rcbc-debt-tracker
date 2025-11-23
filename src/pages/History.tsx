import { useState, useEffect } from 'react';
import { subscribeToPayments } from '../services/firestoreService';
import type { Payment } from '../types/debt';

export const History = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToPayments(100, (updatedPayments) => {
      setPayments(updatedPayments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalPaid = payments
    .filter(p => p.type === 'payment')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalInterest = payments
    .filter(p => p.type === 'payment')
    .reduce((sum, p) => sum + p.interest, 0);

  const totalPrincipal = payments
    .filter(p => p.type === 'payment')
    .reduce((sum, p) => sum + p.principal, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-matcha-600 mx-auto mb-4"></div>
          <p className="text-matcha-700 dark:text-cream-200">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-cream-50 dark:bg-matcha-800 shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-matcha-900 dark:text-cream-50">Payment History</h1>
          <p className="text-sm text-matcha-600 dark:text-cream-200 mt-1">
            {payments.length} total transactions
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      {payments.length > 0 && (
        <div className="mx-4 mt-4 grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-xs opacity-90 mb-1">Total Paid</p>
            <p className="text-lg font-bold">
              ₱{totalPaid.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-xs opacity-90 mb-1">Principal</p>
            <p className="text-lg font-bold">
              ₱{totalPrincipal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
            <p className="text-xs opacity-90 mb-1">Interest</p>
            <p className="text-lg font-bold">
              ₱{totalInterest.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {/* Payment List */}
      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 mt-20">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-matcha-900 dark:text-cream-50 mb-2">
            No Payment History Yet
          </h2>
          <p className="text-center text-matcha-700 dark:text-cream-200">
            Your payment history will appear here once you start making payments.
          </p>
        </div>
      ) : (
        <div className="mx-4 mt-6">
          <h3 className="text-lg font-semibold text-matcha-900 dark:text-cream-50 mb-3">
            All Transactions
          </h3>
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-cream-50 dark:bg-matcha-800 rounded-xl shadow-md p-4 border border-transparent dark:border-cream-200/10"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">
                        {payment.type === 'payment' ? '💳' : '✏️'}
                      </span>
                      <p className="font-medium text-matcha-900 dark:text-cream-100">
                        {payment.type === 'payment' ? 'Payment' : 'Adjustment'}
                      </p>
                    </div>
                    <p className="text-sm text-matcha-600 dark:text-matcha-400">
                      {payment.date.toLocaleDateString('en-PH', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    {payment.note && (
                      <p className="text-xs text-matcha-500 dark:text-matcha-500 mt-1">
                        {payment.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-matcha-900 dark:text-cream-100">
                      ₱{Math.abs(payment.amount).toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    {payment.type === 'payment' && (
                      <div className="text-xs mt-1 space-y-0.5">
                        <p className="text-green-600 dark:text-green-400">
                          Principal: ₱{payment.principal.toFixed(2)}
                        </p>
                        <p className="text-red-600 dark:text-red-400">
                          Interest: ₱{payment.interest.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
