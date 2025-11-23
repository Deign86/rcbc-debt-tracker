import { BILLING_CONSTANTS } from '../config/billingConstants';
import { calculateSimpleADBInterest } from './adbInterestCalculation';
import type { Payment } from '../types/debt';

export interface MilestoneData {
  percentage: number;
  reached: boolean;
  label: string;
  amountPaid: number;
  remainingAmount: number;
}

export interface InterestSavingsData {
  totalInterestPaid: number;
  totalInterestSavedVsMinimum: number;
  projectedInterestIfMinimumOnly: number;
  savingsPercentage: number;
}

export interface DebtFreeProjection {
  projectedPayoffDate: Date;
  monthsRemaining: number;
  monthsSavedVsMinimum: number;
  averageMonthlyPayment: number;
  projectedTotalInterest: number;
  daysUntilNextPayment: number;
  nextPaymentDue: Date;
}

/**
 * Calculate debt repayment milestones
 */
export function calculateMilestones(
  currentPrincipal: number,
  initialDebt: number = BILLING_CONSTANTS.INITIAL_DEBT
): MilestoneData[] {
  const totalPaid = initialDebt - currentPrincipal;
  const progressPercentage = (totalPaid / initialDebt) * 100;

  const milestones = [
    { percentage: 25, label: '25% Paid Off! 🎯' },
    { percentage: 50, label: 'Halfway There! 🔥' },
    { percentage: 75, label: '75% Complete! 💪' },
    { percentage: 100, label: 'Debt Free! 🎉' },
  ];

  return milestones.map(milestone => ({
    percentage: milestone.percentage,
    label: milestone.label,
    reached: progressPercentage >= milestone.percentage,
    amountPaid: (initialDebt * milestone.percentage) / 100,
    remainingAmount: Math.max(0, (initialDebt * milestone.percentage) / 100 - totalPaid),
  }));
}

/**
 * Calculate interest savings compared to minimum-only payments
 * Uses proper RCBC Average Daily Balance method
 */
export function calculateInterestSavings(
  payments: Payment[],
  currentPrincipal: number,
  initialDebt: number = BILLING_CONSTANTS.INITIAL_DEBT
): InterestSavingsData {
  // Calculate actual interest paid from payment history
  const totalInterestPaid = payments.reduce((sum, payment) => sum + payment.interest, 0);

  // Calculate what would have been paid if only minimum payments were made (using ADB)
  const minimumPaymentAmount = BILLING_CONSTANTS.INITIAL_MIN_PAYMENT;
  
  let projectedBalance = initialDebt;
  let projectedTotalInterest = 0;
  let monthCount = 0;
  const maxMonths = 600; // Safety limit (50 years)

  // Simulate minimum-only payments using ADB method
  while (projectedBalance > 0 && monthCount < maxMonths) {
    // Calculate interest using ADB for full billing cycle
    const interestCharge = calculateSimpleADBInterest(projectedBalance);
    const principalPayment = Math.max(0, minimumPaymentAmount - interestCharge);
    
    projectedTotalInterest += interestCharge;
    projectedBalance -= principalPayment;
    monthCount++;

    // Recalculate minimum payment (5% of remaining balance or 500)
    const newMinimum = Math.max(
      projectedBalance * BILLING_CONSTANTS.MINIMUM_PAYMENT_RATE,
      BILLING_CONSTANTS.MINIMUM_PAYMENT_FLOOR
    );
    if (newMinimum < minimumPaymentAmount) {
      break;
    }
  }

  // Calculate interest that would have accumulated at current progress point
  const progressRatio = (initialDebt - currentPrincipal) / initialDebt;
  const projectedInterestAtThisPoint = projectedTotalInterest * progressRatio;

  const interestSaved = Math.max(0, projectedInterestAtThisPoint - totalInterestPaid);
  const savingsPercentage = projectedInterestAtThisPoint > 0 
    ? (interestSaved / projectedInterestAtThisPoint) * 100 
    : 0;

  return {
    totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
    totalInterestSavedVsMinimum: Math.round(interestSaved * 100) / 100,
    projectedInterestIfMinimumOnly: Math.round(projectedTotalInterest * 100) / 100,
    savingsPercentage: Math.round(savingsPercentage * 100) / 100,
  };
}

/**
 * Project debt-free date based on payment history
 * Uses proper RCBC Average Daily Balance method
 */
export function projectDebtFreeDate(
  payments: Payment[],
  currentPrincipal: number,
  minimumPayment: number
): DebtFreeProjection {
  // Calculate average monthly payment from recent history (last 3 months or all if less)
  const recentPayments = payments.slice(0, 3);
  const averageMonthlyPayment = recentPayments.length > 0
    ? recentPayments.reduce((sum, p) => sum + p.amount, 0) / recentPayments.length
    : minimumPayment;

  // Project forward to payoff using ADB method
  let balance = currentPrincipal;
  let totalInterest = 0;
  let monthsRemaining = 0;
  const maxMonths = 600; // Safety limit

  while (balance > 0 && monthsRemaining < maxMonths) {
    // Calculate interest using ADB for full billing cycle
    const interestCharge = calculateSimpleADBInterest(balance);
    const principalPayment = Math.min(balance, Math.max(0, averageMonthlyPayment - interestCharge));
    
    totalInterest += interestCharge;
    balance -= principalPayment;
    monthsRemaining++;

    // If payment doesn't cover interest, use minimum payment
    if (principalPayment <= 0) {
      const minInterest = calculateSimpleADBInterest(balance);
      const minPrincipal = Math.min(balance, Math.max(0, minimumPayment - minInterest));
      balance -= minPrincipal;
    }
  }

  // Calculate minimum-only payoff time for comparison
  let minBalance = currentPrincipal;
  let monthsIfMinimumOnly = 0;
  const minPaymentAmount = Math.max(currentPrincipal * BILLING_CONSTANTS.MINIMUM_PAYMENT_RATE, BILLING_CONSTANTS.MINIMUM_PAYMENT_FLOOR);

  while (minBalance > 0 && monthsIfMinimumOnly < maxMonths) {
    const interestCharge = calculateSimpleADBInterest(minBalance);
    const principalPayment = Math.max(0, minPaymentAmount - interestCharge);
    minBalance -= principalPayment;
    monthsIfMinimumOnly++;
  }

  const monthsSavedVsMinimum = Math.max(0, monthsIfMinimumOnly - monthsRemaining);

  // Calculate projected payoff date from next billing cycle
  const today = new Date();
  const projectedPayoffDate = new Date(today);
  projectedPayoffDate.setMonth(projectedPayoffDate.getMonth() + monthsRemaining);

  // Calculate next payment due date (17th)
  const nextPaymentDue = new Date(today);
  nextPaymentDue.setDate(BILLING_CONSTANTS.DUE_DATE_DAY);
  
  // If we've passed this month's due date, move to next month
  if (today.getDate() > BILLING_CONSTANTS.DUE_DATE_DAY) {
    nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);
  }

  const daysUntilNextPayment = Math.ceil(
    (nextPaymentDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    projectedPayoffDate,
    monthsRemaining,
    monthsSavedVsMinimum,
    averageMonthlyPayment: Math.round(averageMonthlyPayment * 100) / 100,
    projectedTotalInterest: Math.round(totalInterest * 100) / 100,
    daysUntilNextPayment,
    nextPaymentDue,
  };
}

/**
 * Get motivational message based on progress
 */
export function getMotivationalMessage(progressPercentage: number): string {
  if (progressPercentage >= 100) {
    return "🎉 Congratulations! You're debt-free!";
  } else if (progressPercentage >= 75) {
    return "💪 You're in the home stretch! Keep pushing!";
  } else if (progressPercentage >= 50) {
    return "🔥 Halfway there! Your hard work is paying off!";
  } else if (progressPercentage >= 25) {
    return "🎯 Great progress! You've paid off a quarter of your debt!";
  } else if (progressPercentage > 0) {
    return "🌱 Every payment counts! Keep building momentum!";
  }
  return "Start your debt-free journey today!";
}

/**
 * Check if a new milestone was just reached
 */
export function checkNewMilestone(
  previousPrincipal: number,
  currentPrincipal: number,
  initialDebt: number = BILLING_CONSTANTS.INITIAL_DEBT
): { reached: boolean; milestone: number } | null {
  const previousProgress = ((initialDebt - previousPrincipal) / initialDebt) * 100;
  const currentProgress = ((initialDebt - currentPrincipal) / initialDebt) * 100;

  const milestones = [25, 50, 75, 100];

  for (const milestone of milestones) {
    if (previousProgress < milestone && currentProgress >= milestone) {
      return { reached: true, milestone };
    }
  }

  return null;
}
