import { useState } from 'react';
import { DebtCard } from '../components/DebtCard';
import { PaymentForm } from '../components/PaymentForm';
import { EditDebtSheet } from '../components/EditDebtSheet';
import { useDebtCalculator } from '../hooks/useDebtCalculator';
import type { Payment } from '../types/debt';

const INITIAL_DEBT = 50249.75;

export const Dashboard = () => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);

  const {
    debtState,
    calculatePayment,
    applyPayment,
    adjustPrincipal,
    monthlyRate,
  } = useDebtCalculator({
    currentPrincipal: INITIAL_DEBT,
    interestRate: 0.035,
    minimumPayment: INITIAL_DEBT * 0.05,
    statementDate: new Date(),
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
  });

  const handlePaymentSubmit = (amount: number, calculation: any) => {
    const newPayment: Payment = {
      id: Date.now().toString(),
      amount,
      date: new Date(),
      principal: calculation.principal,
      interest: calculation.interest,
      type: 'payment',
    };
    
    applyPayment(amount);
    setPayments([newPayment, ...payments]);
  };

  const handleDebtAdjustment = (newAmount: number, note: string) => {
    const adjustment: Payment = {
      id: Date.now().toString(),
      amount: newAmount - debtState.currentPrincipal,
      date: new Date(),
      principal: newAmount - debtState.currentPrincipal,
      interest: 0,
      type: 'adjustment',
      note,
    };
    
    adjustPrincipal(newAmount);
    setPayments([adjustment, ...payments]);
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Debt Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">RCBC Credit Card Repayment</p>
        </div>
      </div>

      {/* Debt Card */}
      <DebtCard
        totalDebt={debtState.currentPrincipal}
        minimumPayment={debtState.minimumPayment}
        interestRate={monthlyRate}
        onEdit={() => setIsEditOpen(true)}
      />

      {/* Payment Form */}
      <PaymentForm
        onCalculate={calculatePayment}
        onSubmit={handlePaymentSubmit}
      />

      {/* Recent Payments */}
      {payments.length > 0 && (
        <div className="mx-4 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h3>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {payments.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="p-4 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {payment.type === 'payment' ? '💳 Payment' : '✏️ Adjustment'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {payment.date.toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    {payment.note && (
                      <p className="text-xs text-gray-400 mt-1">{payment.note}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ₱{Math.abs(payment.amount).toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
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
    </div>
  );
};
