/**
 * Credit Card Billing Configuration
 * 
 * RCBC Credit Card Billing Cycle:
 * - Billing cycle starts on the 22nd of every month
 * - Payment due date is the 17th of every month
 * - Monthly interest rate: 3.5% (configurable per card)
 * - Uses Average Daily Balance (ADB) method with daily compounding
 * 
 * Interest Formula:
 * Interest = (Average Daily Balance) × (Daily Interest Rate) × (Days in Billing Cycle)
 * Where: Daily Interest Rate = Monthly Rate / 30
 */

export const BILLING_CONSTANTS = {
  // Billing cycle day (day of month when new billing cycle starts)
  BILLING_CYCLE_START_DAY: 22,
  
  // Payment due date (day of month when payment is due)
  DUE_DATE_DAY: 17,
  
  // Monthly interest rate (3.5% - adjust based on your card's actual rate)
  MONTHLY_INTEREST_RATE: 0.035,
  
  // Daily interest rate (Monthly Rate / 30 days)
  DAILY_INTEREST_RATE: 0.035 / 30, // 0.001166667
  
  // Standard billing cycle length in days
  BILLING_CYCLE_DAYS: 30,
  
  // Initial debt amount
  INITIAL_DEBT: 50249.75,
  
  // Initial minimum payment
  INITIAL_MIN_PAYMENT: 1508.00,
  
  // Minimum payment calculation
  MINIMUM_PAYMENT_RATE: 0.05, // 5% of balance
  MINIMUM_PAYMENT_FLOOR: 500, // Minimum ₱500
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
