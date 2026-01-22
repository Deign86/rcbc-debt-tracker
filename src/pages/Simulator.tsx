import { useState, useEffect } from 'react';
import { useDebtCalculator } from '../hooks/useDebtCalculator';
import { loadDebtState } from '../services/firestoreService';
import { BILLING_CONSTANTS, getNextDueDate } from '../config/billingConstants';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currency';
import { showError } from '../utils/errorHandler';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { Calculator, TrendingUp, Coins, Clock } from "lucide-react";

export const Simulator = () => {
  const [monthlyPayment, setMonthlyPayment] = useState('5000');
  const [showSchedule, setShowSchedule] = useState(false);
  const [currentPrincipal, setCurrentPrincipal] = useState<number>(BILLING_CONSTANTS.INITIAL_DEBT);

  // Load debt state when component mounts (for state persistence across tabs)
  useEffect(() => {
    loadDebtState().then(savedState => {
      if (savedState) {
        setCurrentPrincipal(savedState.currentPrincipal);
      }
    }).catch(error => {
      // Silently fail - app will use defaults if Firebase is not configured
      console.warn('Failed to load debt state:', error);
    });
  }, []);

  const { simulatePayments } = useDebtCalculator({
    currentPrincipal: currentPrincipal,
    interestRate: BILLING_CONSTANTS.MONTHLY_INTEREST_RATE,
    minimumPayment: Math.max(currentPrincipal * BILLING_CONSTANTS.MINIMUM_PAYMENT_RATE, BILLING_CONSTANTS.MINIMUM_PAYMENT_FLOOR),
    statementDate: new Date(),
    dueDate: getNextDueDate(),
  });

  // ... inside component

  const handleAmountChange = (value: string) => {
    const formatted = formatCurrencyInput(value);
    setMonthlyPayment(formatted);
    setShowSchedule(false);
  };

  const handleSimulate = () => {
    const amount = parseCurrencyInput(monthlyPayment);
    if (!isNaN(amount) && amount > 0) {
      setShowSchedule(true);
    }
  };

  const schedule = showSchedule
    ? simulatePayments(parseCurrencyInput(monthlyPayment))
    : [];

  const totalInterest = schedule.reduce((sum, month) => sum + month.interest, 0);
  const totalPaid = schedule.reduce((sum, month) => sum + month.payment, 0);
  const monthsToPayoff = schedule.length;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="glass-strong sticky top-0 z-10 mx-4 mt-4 rounded-2xl">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="glass-primary p-2.5 rounded-xl glass-glow">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Payment Simulator</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Plan your repayment strategy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Input */}
      <GlassCard variant="default" className="mx-4 mt-6">
        <GlassCardHeader>
          <GlassCardTitle className="text-lg font-semibold text-foreground">
            Monthly Payment Amount
          </GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl font-medium">
              ₱
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={monthlyPayment}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="5000.00"
              className="w-full pl-10 pr-4 py-4 text-2xl font-semibold glass-input border-white/20 dark:border-white/10 text-foreground placeholder-muted-foreground rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-colors"
            />
          </div>

          {/* Quick Amounts */}
          <div className="grid grid-cols-3 gap-2">
            {[3000, 5000, 10000].map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setMonthlyPayment(amount.toString());
                  setShowSchedule(false);
                }}
                className="py-3 glass-button text-sm font-medium text-foreground cursor-pointer"
              >
                ₱{amount.toLocaleString()}
              </button>
            ))}
          </div>

          <button
            onClick={handleSimulate}
            disabled={!monthlyPayment || parseCurrencyInput(monthlyPayment) <= 0}
            className="w-full py-4 bg-primary hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-xl transition-colors shadow-lg cursor-pointer"
          >
            Calculate Payoff Timeline
          </button>
        </GlassCardContent>
      </GlassCard>

      {/* Results Summary */}
      {showSchedule && schedule.length > 0 && (
        <>
          <GlassCard variant="primary" glow className="mx-4 mt-6 overflow-hidden relative animate-fade-in">
            {/* Static orbs */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-primary/15 rounded-full blur-xl pointer-events-none" />
            
            <GlassCardContent className="pt-6 relative">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Payoff Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-subtle p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Time to Payoff</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {monthsToPayoff} {monthsToPayoff === 1 ? 'month' : 'months'}
                  </p>
                </div>
                <div className="glass-subtle p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Total Interest</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    ₱{totalInterest.toLocaleString('en-PH', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 dark:border-white/10">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Total Amount Paid</p>
                  <p className="text-xl font-bold text-foreground">
                    ₱{totalPaid.toLocaleString('en-PH', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Payment Schedule */}
          <div className="mx-4 mt-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="glass-primary p-2 rounded-xl">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Payment Schedule
              </h3>
            </div>
            <GlassCard variant="default" className="overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {schedule.map((month) => (
                  <div
                    key={month.month}
                    className="p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-foreground">
                          Month {month.month}
                        </p>
                        <div className="mt-1 space-y-0.5">
                          <p className="text-xs text-muted-foreground">
                            Interest: ₱{month.interest.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Principal: ₱{month.principal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          ₱{month.balance.toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          remaining
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </>
      )}

      {/* Warning for low payments */}
      {showSchedule && schedule.length >= 60 && (
        <GlassCard variant="subtle" className="mx-4 mt-4 border-amber-500/30 bg-amber-500/10">
          <GlassCardContent className="py-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ This payment amount will take over 5 years to pay off. Consider increasing your monthly payment to reduce interest charges.
            </p>
          </GlassCardContent>
        </GlassCard>
      )}
    </div>
  );
};
