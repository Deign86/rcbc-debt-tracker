import { useState, useEffect } from 'react';
import { DebtCard } from '../components/DebtCard';
import { PaymentForm } from '../components/PaymentForm';
import { EditDebtSheet } from '../components/EditDebtSheet';
import { EditMinPaymentSheet } from '../components/EditMinPaymentSheet';
import { useDebtCalculator } from '../hooks/useDebtCalculator';
import {
  saveDebtState,
  loadDebtState,
  savePayment,
  subscribeToPayments,
  resetAllData
} from '../services/firestoreService';
import type { Payment } from '../types/debt';

const INITIAL_DEBT = 50249.75;
const INITIAL_MIN_PAYMENT = 1508.00; // Updated to actual minimum payment

export const Dashboard = () => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMinPaymentEditOpen, setIsMinPaymentEditOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    debtState,
    calculatePayment,
    applyPayment,
    adjustPrincipal,
    updateMinimumPayment,
    monthlyRate,
  } = useDebtCalculator({
    currentPrincipal: INITIAL_DEBT,
    interestRate: 0.035,
    minimumPayment: INITIAL_MIN_PAYMENT,
    statementDate: new Date(),
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
  });

  // Load debt state and payments from Firestore on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedDebtState = await loadDebtState();
        if (savedDebtState) {
          adjustPrincipal(savedDebtState.currentPrincipal);
          updateMinimumPayment(savedDebtState.minimumPayment);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Subscribe to real-time payment updates
  useEffect(() => {
    const unsubscribe = subscribeToPayments(50, (updatedPayments) => {
      setPayments(updatedPayments);
    });

    return () => unsubscribe();
  }, []);

  // Save debt state to Firestore whenever it changes
  useEffect(() => {
    if (!loading) {
      saveDebtState(debtState).catch(error => {
        console.error('Error saving debt state:', error);
      });
    }
  }, [debtState, loading]);

  const handlePaymentSubmit = async (amount: number, calculation: any) => {
    try {
      const newPayment = {
        amount,
        date: new Date(),
        principal: calculation.principal,
        interest: calculation.interest,
        type: 'payment' as const,
      };

      await savePayment(newPayment);
      applyPayment(amount);
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert('Failed to save payment. Please try again.');
    }
  };

  const handleDebtAdjustment = async (newAmount: number, note: string) => {
    try {
      const adjustment = {
        amount: newAmount - debtState.currentPrincipal,
        date: new Date(),
        principal: newAmount - debtState.currentPrincipal,
        interest: 0,
        type: 'adjustment' as const,
        note,
      };

      await savePayment(adjustment);
      adjustPrincipal(newAmount);
    } catch (error) {
      console.error('Error adjusting debt:', error);
      alert('Failed to save adjustment. Please try again.');
    }
  };

  const handleReset = async () => {
    const confirmMessage = 
      'Are you sure you want to reset all data?\n\n' +
      'This will:\n' +
      '• Delete all payment history\n' +
      '• Reset debt to initial amount\n' +
      '• Clear all adjustments\n\n' +
      'This action cannot be undone!';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await resetAllData();
      // Reset to initial values
      adjustPrincipal(INITIAL_DEBT);
      updateMinimumPayment(INITIAL_MIN_PAYMENT);
      alert('All data has been reset successfully.');
      window.location.reload();
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Failed to reset data. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-matcha-600 mx-auto mb-4"></div>
          <p className="text-matcha-700 dark:text-cream-300">Loading your debt data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-matcha-500 dark:bg-matcha-800 shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Debt Repayment Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-white dark:text-cream-50">Debt Tracker</h1>
              <p className="text-sm text-white/80 dark:text-cream-100/80">Financial Freedom Journey</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm bg-cream-100 dark:bg-matcha-900 text-matcha-800 dark:text-cream-200 rounded-lg hover:bg-cream-200 dark:hover:bg-matcha-700 transition-colors font-medium border border-matcha-300 dark:border-matcha-600"
            title="Reset all data"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Debt Card */}
      <DebtCard
        totalDebt={debtState.currentPrincipal}
        minimumPayment={debtState.minimumPayment}
        interestRate={monthlyRate}
        onEdit={() => setIsEditOpen(true)}
        onEditMinPayment={() => setIsMinPaymentEditOpen(true)}
      />

      {/* Payment Form */}
      <PaymentForm
        onCalculate={calculatePayment}
        onSubmit={handlePaymentSubmit}
      />

      {/* Recent Payments */}
      {payments.length > 0 && (
        <div className="mx-4 mt-6">
          <h3 className="text-lg font-semibold text-matcha-800 dark:text-cream-100 mb-3">Recent Activity</h3>
          <div className="bg-cream-50 dark:bg-matcha-800 rounded-xl shadow-md overflow-hidden border border-matcha-200 dark:border-matcha-600">
            {payments.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="p-4 border-b border-matcha-200 dark:border-matcha-700 last:border-b-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-matcha-800 dark:text-cream-100">
                      {payment.type === 'payment' ? '💳 Payment' : '✏️ Adjustment'}
                    </p>
                    <p className="text-sm text-matcha-600 dark:text-cream-300 mt-1">
                      {payment.date.toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    {payment.note && (
                      <p className="text-xs text-matcha-500 dark:text-cream-400 mt-1">{payment.note}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-matcha-800 dark:text-cream-100">
                      ₱{Math.abs(payment.amount).toLocaleString('en-PH', {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    {payment.type === 'payment' && (
                      <div className="text-xs mt-1 space-y-0.5">
                        <p className="text-green-600">
                          Principal: ₱{payment.principal.toFixed(2)}
                        </p>
                        <p className="text-red-600">
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

      {/* Edit Debt Sheet */}
      <EditDebtSheet
        isOpen={isEditOpen}
        currentAmount={debtState.currentPrincipal}
        onClose={() => setIsEditOpen(false)}
        onSave={handleDebtAdjustment}
      />

      {/* Edit Minimum Payment Sheet */}
      <EditMinPaymentSheet
        isOpen={isMinPaymentEditOpen}
        currentMinPayment={debtState.minimumPayment}
        onClose={() => setIsMinPaymentEditOpen(false)}
        onSave={updateMinimumPayment}
      />
    </div>
  );
};

