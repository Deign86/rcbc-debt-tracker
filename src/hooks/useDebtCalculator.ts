import { useState, useCallback } from 'react';
import type { PaymentCalculation, DebtState } from '../types/debt';
import { calculateSimpleADBInterest, calculatePaymentSplit } from '../utils/adbInterestCalculation';
import { BILLING_CONSTANTS } from '../config/billingConstants';

/**
 * RCBC Credit Card Interest Calculation Hook
 * 
 * Uses proper RCBC Average Daily Balance (ADB) method:
 * - Interest = Average Daily Balance × Daily Interest Rate × Days in Billing Cycle
 * - Daily Interest Rate = Monthly Rate / 30 = 0.035 / 30 = 0.001166667
 * - Billing Cycle: 30 days (starts on 22nd, ends on 21st)
 * - Interest Rate: 3.5% monthly (42% APR)
 * - Minimum Payment: 5% of outstanding balance or ₱500, whichever is higher
 */

export const useDebtCalculator = (initialDebt: DebtState) => {
  const [debtState, setDebtState] = useState<DebtState>(initialDebt);
  const [customMinPayment, setCustomMinPayment] = useState<number | null>(null);

  /**
   * Calculate how a payment will be split between interest and principal
   * Uses proper RCBC Average Daily Balance method
   */
  const calculatePayment = useCallback((paymentAmount: number): PaymentCalculation => {
    const { currentPrincipal } = debtState;
    
    // Calculate interest using ADB method (assumes full billing cycle)
    const split = calculatePaymentSplit(
      currentPrincipal,
      paymentAmount,
      BILLING_CONSTANTS.BILLING_CYCLE_DAYS
    );
    
    // Calculate next minimum payment (5% of remaining or ₱500, or custom if set)
    let nextMinimumPayment: number;
    if (customMinPayment !== null && split.remainingBalance > 0) {
      nextMinimumPayment = customMinPayment;
    } else {
      nextMinimumPayment = Math.max(
        split.remainingBalance * BILLING_CONSTANTS.MINIMUM_PAYMENT_RATE,
        split.remainingBalance > 0 ? BILLING_CONSTANTS.MINIMUM_PAYMENT_FLOOR : 0
      );
    }
    
    return {
      interest: split.interest,
      principal: split.principal,
      remainingBalance: split.remainingBalance,
      nextMinimumPayment: Math.round(nextMinimumPayment * 100) / 100,
    };
  }, [debtState, customMinPayment]);

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
    let nextMinimumPayment: number;
    if (customMinPayment !== null && newPrincipal > 0) {
      nextMinimumPayment = customMinPayment;
    } else {
      nextMinimumPayment = Math.max(
        newPrincipal * BILLING_CONSTANTS.MINIMUM_PAYMENT_RATE,
        newPrincipal > 0 ? BILLING_CONSTANTS.MINIMUM_PAYMENT_FLOOR : 0
      );
    }
    
    setDebtState(prev => ({
      ...prev,
      currentPrincipal: Math.round(newPrincipal * 100) / 100,
      minimumPayment: Math.round(nextMinimumPayment * 100) / 100,
    }));
  }, [customMinPayment]);

  /**
   * Update the custom minimum payment amount
   */
  const updateMinimumPayment = useCallback((newMinPayment: number) => {
    setCustomMinPayment(newMinPayment);
    setDebtState(prev => ({
      ...prev,
      minimumPayment: Math.round(newMinPayment * 100) / 100,
    }));
  }, []);

  /**
   * Simulate payment schedule using ADB method
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
      // Calculate interest using ADB method for full billing cycle
      const interestCharge = calculateSimpleADBInterest(balance);
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
    updateMinimumPayment,
    simulatePayments,
    monthlyRate: BILLING_CONSTANTS.MONTHLY_INTEREST_RATE,
    dailyRate: BILLING_CONSTANTS.DAILY_INTEREST_RATE,
    annualRate: BILLING_CONSTANTS.MONTHLY_INTEREST_RATE * 12,
  };
};
