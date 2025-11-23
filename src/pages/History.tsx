import { useState, useEffect } from 'react';
import { subscribeToPayments, deletePayment, loadDebtState } from '../services/firestoreService';
import type { Payment } from '../types/debt';
import { CreditCard, Edit3, BarChart3, Trash2, AlertTriangle } from 'lucide-react';

export const History = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Load debt state when component mounts (for state persistence across tabs)
  useEffect(() => {
    loadDebtState().catch(error => {
      console.error('Error loading debt state:', error);
    });
  }, []);

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

  const handleDeleteClick = (paymentId: string) => {
    setConfirmDeleteId(paymentId);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    
    try {
      setDeletingId(confirmDeleteId);
      await deletePayment(confirmDeleteId);
      setConfirmDeleteId(null);
    } catch (error) {
      console.error('Failed to delete payment:', error);
      alert('Failed to delete payment. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

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
          <div className="bg-gradient-to-br from-matcha-500 to-matcha-600 dark:from-matcha-600 dark:to-matcha-700 rounded-ios-lg p-4 text-white shadow-lg">
            <p className="text-xs opacity-90 mb-1">Total Paid</p>
            <p className="text-lg font-bold">
              ₱{totalPaid.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-ios-lg p-4 text-white shadow-lg">
            <p className="text-xs opacity-90 mb-1">Principal</p>
            <p className="text-lg font-bold">
              ₱{totalPrincipal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-ios-lg p-4 text-white shadow-lg">
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
          <div className="mb-4">
            <BarChart3 className="h-16 w-16 text-matcha-600 dark:text-matcha-400" />
          </div>
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
                className="bg-cream-50 dark:bg-matcha-800 rounded-xl shadow-md p-4 border-2 border-matcha-200 dark:border-matcha-700"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {payment.type === 'payment' ? 
                        <CreditCard className="h-5 w-5 text-matcha-700 dark:text-matcha-300" /> : 
                        <Edit3 className="h-5 w-5 text-matcha-700 dark:text-matcha-300" />
                      }
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
                      <p className="text-xs text-matcha-600 dark:text-matcha-400 mt-1">
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
                  <button
                    onClick={() => handleDeleteClick(payment.id)}
                    disabled={deletingId === payment.id}
                    className="flex-shrink-0 p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete payment"
                  >
                    {deletingId === payment.id ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-cream-50 dark:bg-matcha-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-matcha-300 dark:border-matcha-700">
            <div className="text-center mb-6">
              <div className="mb-4 flex justify-center">
                <AlertTriangle className="h-16 w-16 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-matcha-900 dark:text-cream-50 mb-2">
                Delete Payment?
              </h2>
              <p className="text-matcha-700 dark:text-matcha-300">
                Are you sure you want to delete this payment record? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 py-3 px-4 rounded-ios-md bg-matcha-200 dark:bg-matcha-700 text-matcha-900 dark:text-cream-100 font-semibold hover:bg-matcha-300 dark:hover:bg-matcha-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={!!deletingId}
                className="flex-1 py-3 px-4 rounded-ios-md bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
