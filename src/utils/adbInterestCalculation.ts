import { BILLING_CONSTANTS } from '../config/billingConstants';
import { differenceInDays } from 'date-fns';

/**
 * RCBC Average Daily Balance (ADB) Interest Calculation Utility
 * 
 * Based on actual RCBC credit card standards:
 * - Uses Average Daily Balance method
 * - Daily compounding: Daily Rate = Monthly Rate / 30
 * - Interest = ADB × Daily Rate × Days in Cycle
 */

export interface DailyBalanceEntry {
  date: Date;
  balance: number;
}

export interface InterestCalculationResult {
  totalInterest: number;
  averageDailyBalance: number;
  daysInCycle: number;
  dailyRate: number;
}

/**
 * Calculate interest using Average Daily Balance method
 * @param dailyBalances - Array of daily balance entries
 * @param startDate - Billing cycle start date
 * @param endDate - Billing cycle end date (or current date)
 * @returns Interest calculation result
 */
export function calculateADBInterest(
  dailyBalances: DailyBalanceEntry[],
  startDate: Date,
  endDate: Date
): InterestCalculationResult {
  const daysInCycle = Math.max(1, differenceInDays(endDate, startDate) + 1);
  
  // Calculate sum of daily balances
  let sumOfDailyBalances = 0;
  
  if (dailyBalances.length === 0) {
    // No daily balance data, return zero interest
    return {
      totalInterest: 0,
      averageDailyBalance: 0,
      daysInCycle,
      dailyRate: BILLING_CONSTANTS.DAILY_INTEREST_RATE,
    };
  }
  
  // Sort balances by date
  const sortedBalances = [...dailyBalances].sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );
  
  // Fill in gaps and sum daily balances
  const balanceMap = new Map<string, number>();
  sortedBalances.forEach(entry => {
    const dateKey = entry.date.toISOString().split('T')[0];
    balanceMap.set(dateKey, entry.balance);
  });
  
  let currentBalance = sortedBalances[0].balance;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const dayBalance = balanceMap.get(dateKey) ?? currentBalance;
    sumOfDailyBalances += dayBalance;
    currentBalance = dayBalance;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Calculate Average Daily Balance
  const averageDailyBalance = sumOfDailyBalances / daysInCycle;
  
  // Calculate interest: ADB × Daily Rate × Days
  const totalInterest = averageDailyBalance * BILLING_CONSTANTS.DAILY_INTEREST_RATE * daysInCycle;
  
  return {
    totalInterest: Math.round(totalInterest * 100) / 100,
    averageDailyBalance: Math.round(averageDailyBalance * 100) / 100,
    daysInCycle,
    dailyRate: BILLING_CONSTANTS.DAILY_INTEREST_RATE,
  };
}

/**
 * Calculate interest for a simple scenario (constant balance for entire period)
 * This is used when payment happens at end of billing cycle
 * @param balance - Principal balance
 * @param daysInCycle - Number of days (default: 30)
 * @returns Total interest charge
 */
export function calculateSimpleADBInterest(
  balance: number,
  daysInCycle: number = BILLING_CONSTANTS.BILLING_CYCLE_DAYS
): number {
  // Interest = Balance × Daily Rate × Days
  // This is equivalent to: Balance × (Monthly Rate / 30) × 30 = Balance × Monthly Rate
  const interest = balance * BILLING_CONSTANTS.DAILY_INTEREST_RATE * daysInCycle;
  return Math.round(interest * 100) / 100;
}

/**
 * Calculate interest when payment is made mid-cycle
 * @param initialBalance - Balance at start of cycle
 * @param paymentAmount - Amount paid
 * @param paymentDay - Day of month when payment was made
 * @param cycleStartDay - Billing cycle start day (default: 22)
 * @param cycleEndDay - Billing cycle end day (default: 21 of next month)
 * @returns Total interest for the billing cycle
 */
export function calculateMidCycleInterest(
  initialBalance: number,
  paymentAmount: number,
  paymentDay: number,
  cycleStartDay: number = BILLING_CONSTANTS.BILLING_CYCLE_START_DAY
): InterestCalculationResult {
  // Days before payment
  let daysBeforePayment: number;
  if (paymentDay >= cycleStartDay) {
    daysBeforePayment = paymentDay - cycleStartDay;
  } else {
    daysBeforePayment = (30 - cycleStartDay) + paymentDay;
  }
  
  // Days after payment
  const daysAfterPayment = BILLING_CONSTANTS.BILLING_CYCLE_DAYS - daysBeforePayment;
  
  // Balance after payment
  const balanceAfterPayment = Math.max(0, initialBalance - paymentAmount);
  
  // Sum of daily balances
  const sumBeforePayment = initialBalance * daysBeforePayment;
  const sumAfterPayment = balanceAfterPayment * daysAfterPayment;
  const totalSum = sumBeforePayment + sumAfterPayment;
  
  // Average Daily Balance
  const averageDailyBalance = totalSum / BILLING_CONSTANTS.BILLING_CYCLE_DAYS;
  
  // Calculate interest
  const totalInterest = averageDailyBalance * BILLING_CONSTANTS.DAILY_INTEREST_RATE * BILLING_CONSTANTS.BILLING_CYCLE_DAYS;
  
  return {
    totalInterest: Math.round(totalInterest * 100) / 100,
    averageDailyBalance: Math.round(averageDailyBalance * 100) / 100,
    daysInCycle: BILLING_CONSTANTS.BILLING_CYCLE_DAYS,
    dailyRate: BILLING_CONSTANTS.DAILY_INTEREST_RATE,
  };
}

/**
 * Project interest for multiple billing cycles with payments
 * @param currentBalance - Current principal balance
 * @param monthlyPayment - Expected monthly payment amount
 * @param numberOfMonths - Number of months to project
 * @returns Array of monthly interest charges
 */
export function projectInterestCharges(
  currentBalance: number,
  monthlyPayment: number,
  numberOfMonths: number
): number[] {
  const interestCharges: number[] = [];
  let balance = currentBalance;
  
  for (let month = 0; month < numberOfMonths && balance > 0; month++) {
    // Calculate interest for this billing cycle
    const interest = calculateSimpleADBInterest(balance);
    interestCharges.push(interest);
    
    // Apply payment (assuming end-of-cycle payment)
    const principalPayment = Math.min(balance, Math.max(0, monthlyPayment - interest));
    balance = Math.max(0, balance - principalPayment);
  }
  
  return interestCharges;
}

/**
 * Calculate how a payment will be split between interest and principal
 * using the ADB method
 * @param currentBalance - Current principal balance
 * @param paymentAmount - Payment amount
 * @param daysInCycle - Days in billing cycle
 * @returns Interest and principal breakdown
 */
export function calculatePaymentSplit(
  currentBalance: number,
  paymentAmount: number,
  daysInCycle: number = BILLING_CONSTANTS.BILLING_CYCLE_DAYS
): { interest: number; principal: number; remainingBalance: number } {
  // Calculate interest for the entire cycle at current balance
  const interestCharge = calculateSimpleADBInterest(currentBalance, daysInCycle);
  
  let interestPayment: number;
  let principalPayment: number;
  
  if (paymentAmount <= interestCharge) {
    // Payment doesn't cover full interest
    interestPayment = paymentAmount;
    principalPayment = 0;
  } else {
    // Payment covers interest and reduces principal
    interestPayment = interestCharge;
    // Cap principal payment at remaining balance (handle overpayment)
    principalPayment = Math.min(currentBalance, paymentAmount - interestCharge);
  }
  
  const remainingBalance = Math.max(0, currentBalance - principalPayment);
  
  return {
    interest: Math.round(interestPayment * 100) / 100,
    principal: Math.round(principalPayment * 100) / 100,
    remainingBalance: Math.round(remainingBalance * 100) / 100,
  };
}
