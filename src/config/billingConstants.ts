/**
 * Credit Card Billing Configuration
 * 
 * RCBC Credit Card Billing Cycle:
 * - Billing cycle starts on the 22nd of every month
 * - Payment due date is the 17th of every month
 * - Monthly interest rate: 3.5%
 */

export const BILLING_CONSTANTS = {
  // Billing cycle day (day of month when new billing cycle starts)
  BILLING_CYCLE_START_DAY: 22,
  
  // Payment due date (day of month when payment is due)
  DUE_DATE_DAY: 17,
  
  // Monthly interest rate (3.5%)
  MONTHLY_INTEREST_RATE: 0.035,
  
  // Initial debt amount
  INITIAL_DEBT: 50249.75,
  
  // Initial minimum payment
  INITIAL_MIN_PAYMENT: 1508.00,
} as const;

/**
 * Calculate the next due date based on current date
 * @param currentDate - The current date
 * @returns The next payment due date
 */
export const getNextDueDate = (currentDate: Date = new Date()): Date => {
  const dueDate = new Date(currentDate);
  dueDate.setDate(BILLING_CONSTANTS.DUE_DATE_DAY);
  
  // If we've passed this month's due date, move to next month
  if (currentDate.getDate() > BILLING_CONSTANTS.DUE_DATE_DAY) {
    dueDate.setMonth(dueDate.getMonth() + 1);
  }
  
  return dueDate;
};

/**
 * Calculate the current billing cycle start date
 * @param currentDate - The current date
 * @returns The current billing cycle start date
 */
export const getCurrentBillingCycleStart = (currentDate: Date = new Date()): Date => {
  const billingStart = new Date(currentDate);
  billingStart.setDate(BILLING_CONSTANTS.BILLING_CYCLE_START_DAY);
  
  // If we haven't reached this month's cycle start, use last month
  if (currentDate.getDate() < BILLING_CONSTANTS.BILLING_CYCLE_START_DAY) {
    billingStart.setMonth(billingStart.getMonth() - 1);
  }
  
  return billingStart;
};

/**
 * Calculate days remaining until due date
 * @param currentDate - The current date
 * @returns Number of days until next due date
 */
export const getDaysUntilDue = (currentDate: Date = new Date()): number => {
  const nextDue = getNextDueDate(currentDate);
  const diffTime = nextDue.getTime() - currentDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
