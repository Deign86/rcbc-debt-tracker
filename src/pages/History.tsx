import { useState, useEffect } from 'react';
import { subscribeToPayments, deletePayment, loadDebtState } from '../services/firestoreService';
import type { Payment } from '../types/debt';
import { CreditCard, Edit3, BarChart3, Trash2, AlertTriangle, History as HistoryIcon } from 'lucide-react';
import { showError } from '../utils/errorHandler';
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";

export const History = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Load debt state when component mounts (for state persistence across tabs)
  useEffect(() => {
    loadDebtState().catch(error => {
      // Silently fail - app will use defaults if Firebase is not configured
      console.warn('Failed to load debt state:', error);
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
      showError(error, 'Failed to delete payment');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="glass-strong sticky top-0 z-10 mx-4 mt-4 rounded-2xl">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="glass-primary p-2.5 rounded-xl glass-glow">
              <HistoryIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Payment History</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {payments.length} total transactions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {payments.length > 0 && (
        <div className="mx-4 mt-4 grid grid-cols-3 gap-3">
          <GlassCard variant="primary" glow>
            <GlassCardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
              <p className="text-lg font-bold text-foreground">
                ₱{totalPaid.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </GlassCardContent>
          </GlassCard>
          <GlassCard variant="subtle" className="border-green-500/30 bg-green-500/10">
            <GlassCardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Principal</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                ₱{totalPrincipal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </GlassCardContent>
          </GlassCard>
          <GlassCard variant="subtle" className="border-red-500/30 bg-red-500/10">
            <GlassCardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Interest</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                ₱{totalInterest.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </GlassCardContent>
          </GlassCard>
        </div>
      )}

      {/* Payment List */}
      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 mt-20">
          <div className="glass-primary p-6 rounded-2xl mb-4">
            <BarChart3 className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No Payment History Yet
          </h2>
          <p className="text-center text-muted-foreground">
            Your payment history will appear here once you start making payments.
          </p>
        </div>
      ) : (
        <div className="mx-4 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="glass-primary p-2 rounded-xl">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              All Transactions
            </h3>
          </div>
          <div className="space-y-3">
            {payments.map((payment) => (
              <GlassCard 
                key={payment.id}
                variant="subtle"
                className="transition-colors"
              >
                <GlassCardContent className="p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="glass-primary p-1.5 rounded-lg">
                          {payment.type === 'payment' ? 
                            <CreditCard className="h-4 w-4 text-primary" /> : 
                            <Edit3 className="h-4 w-4 text-primary" />
                          }
                        </div>
                        <p className="font-medium text-foreground">
                          {payment.type === 'payment' ? 'Payment' : 'Adjustment'}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {payment.date.toLocaleDateString('en-PH', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                      })}
                    </p>
                    {payment.note && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {payment.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">
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
                    className="flex-shrink-0 p-2.5 rounded-xl glass-button bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    title="Delete payment"
                    style={{ transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
                  >
                    {deletingId === payment.id ? (
                      <div className="w-5 h-5 border-2 border-destructive border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </div>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 glass-overlay flex items-center justify-center z-50 p-4">
          <GlassCard variant="strong" className="max-w-md w-full p-6 animate-scale-in">
            <div className="text-center mb-6">
              <div className="mb-4 flex justify-center">
                <div className="glass-subtle p-4 rounded-2xl border-amber-500/30 bg-amber-500/10">
                  <AlertTriangle className="h-12 w-12 text-amber-500" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Delete Payment?
              </h2>
              <p className="text-muted-foreground">
                Are you sure you want to delete this payment record? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 py-3 px-4 rounded-xl glass-button text-foreground font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={!!deletingId}
                className="flex-1 py-3 px-4 rounded-xl bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {deletingId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
