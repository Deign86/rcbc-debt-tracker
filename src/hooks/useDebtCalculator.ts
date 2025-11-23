import { useState, useCallback } from 'react';
import type { PaymentCalculation, DebtState } from '../types/debt';

/**
 * RCBC Credit Card Interest Calculation Hook
 * 
 * RCBC uses Average Daily Balance method:
 * - Finance Charge = (Average Daily Balance × Interest Rate × Days in Billing Period) / 365
 * - Interest Rate: 3.5% monthly (42% APR) - typical for Philippine credit cards
 * - Minimum Payment: 5% of outstanding balance or ₱500, whichever is higher
 * 
 * For simplicity in this tracker, we'll use a monthly interest calculation:
 * Monthly Interest = Principal × Monthly Rate
 */

const RCBC_MONTHLY_RATE = 0.035; // 3.5% per month (42% APR)
const MINIMUM_PAYMENT_RATE = 0.05; // 5% of balance
const MINIMUM_PAYMENT_FLOOR = 500; // Minimum ₱500

export const useDebtCalculator = (initialDebt: DebtState) => {
  const [debtState, setDebtState] = useState<DebtState>(initialDebt);

  /**
   * Calculate how a payment will be split between interest and principal
   */
  const calculatePayment = useCallback((paymentAmount: number): PaymentCalculation => {
    const { currentPrincipal } = debtState;
    
    // Calculate monthly interest on current principal
    const interestCharge = currentPrincipal * RCBC_MONTHLY_RATE;
    
    // Determine how much goes to principal
    let principalPayment = 0;
    let interestPayment = 0;
    
    if (paymentAmount <= interestCharge) {
      // Payment doesn't cover full interest
      interestPayment = paymentAmount;
      principalPayment = 0;
    } else {
      // Payment covers interest and some principal
      interestPayment = interestCharge;
      principalPayment = paymentAmount - interestCharge;
    }
    
    const remainingBalance = Math.max(0, currentPrincipal - principalPayment);
    
    // Calculate next minimum payment (5% of remaining or ₱500)
    const nextMinimumPayment = Math.max(
      remainingBalance * MINIMUM_PAYMENT_RATE,
      remainingBalance > 0 ? MINIMUM_PAYMENT_FLOOR : 0
    );
    
    return {
      interest: Math.round(interestPayment * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      nextMinimumPayment: Math.round(nextMinimumPayment * 100) / 100,
    };
  }, [debtState]);

  /**
   * Apply a payment and update the debt state
   */
  const applyPayment = useCallback((paymentAmount: number) => {
    const calculation = calculatePayment(paymentAmount);
    
    setDebtState(prev => ({
      ...prev,
      currentPrincipal: calculation.remainingBalance,
      minimumPayment: calculation.nextMinimumPayment,
    }));
    
    return calculation;
  }, [calculatePayment]);

  /**
   * Manually adjust the principal (for corrections or lump sum adjustments)
   */
  const adjustPrincipal = useCallback((newPrincipal: number) => {
    const nextMinimumPayment = Math.max(
      newPrincipal * MINIMUM_PAYMENT_RATE,
      newPrincipal > 0 ? MINIMUM_PAYMENT_FLOOR : 0
    );
    
    setDebtState(prev => ({
      ...prev,
      currentPrincipal: Math.round(newPrincipal * 100) / 100,
      minimumPayment: Math.round(nextMinimumPayment * 100) / 100,
    }));
  }, []);

  /**
   * Simulate payment schedule
   */
  const simulatePayments = useCallback((monthlyPayment: number, months: number = 60) => {
    const schedule: Array<{
      month: number;
      payment: number;
      interest: number;
      principal: number;
      balance: number;
    }> = [];
    
    let balance = debtState.currentPrincipal;
    
    for (let month = 1; month <= months && balance > 0; month++) {
      const interestCharge = balance * RCBC_MONTHLY_RATE;
      const principalPayment = Math.max(0, monthlyPayment - interestCharge);
      const actualPayment = Math.min(monthlyPayment, balance + interestCharge);
      
      balance = Math.max(0, balance - principalPayment);
      
      schedule.push({
        month,
        payment: Math.round(actualPayment * 100) / 100,
        interest: Math.round(interestCharge * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        balance: Math.round(balance * 100) / 100,
      });
      
      if (balance === 0) break;
    }
    
    return schedule;
  }, [debtState]);

  return {
    debtState,
    calculatePayment,
    applyPayment,
    adjustPrincipal,
    simulatePayments,
    monthlyRate: RCBC_MONTHLY_RATE,
    annualRate: RCBC_MONTHLY_RATE * 12,
  };
};
