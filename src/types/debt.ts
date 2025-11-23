export interface Payment {
  id: string;
  amount: number;
  date: Date;
  principal: number;
  interest: number;
  type: 'payment' | 'adjustment';
  note?: string;
}

export interface DebtState {
  currentPrincipal: number;
  interestRate: number; // Monthly interest rate (e.g., 0.035 for 3.5%)
  minimumPayment: number;
  statementDate: Date;
  dueDate: Date;
}

export interface MilestoneAchievement {
  milestone: number; // 25, 50, 75, or 100
  achievedDate: Date;
  principalAtAchievement: number;
  celebrated: boolean; // Has the user seen the celebration?
}

export interface PaymentCalculation {
  interest: number;
  principal: number;
  remainingBalance: number;
  nextMinimumPayment: number;
}
