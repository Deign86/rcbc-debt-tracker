import type { MilestoneData, InterestSavingsData, DebtFreeProjection } from '../utils/debtMotivation';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Coins, Clock, TrendingUp, Trophy, Rocket } from "lucide-react";

interface MotivationalDashboardProps {
  milestones: MilestoneData[];
  interestSavings: InterestSavingsData;
  debtFreeProjection: DebtFreeProjection;
  currentPrincipal: number;
  initialDebt: number;
  motivationalMessage: string;
}

export const MotivationalDashboard = ({
  milestones,
  interestSavings,
  debtFreeProjection,
  currentPrincipal,
  initialDebt,
  motivationalMessage,
}: MotivationalDashboardProps) => {
  const progressPercentage = ((initialDebt - currentPrincipal) / initialDebt) * 100;
  const nextMilestone = milestones.find(m => !m.reached);

  return (
    <div className="space-y-4">
      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-matcha-50 to-cream-100 dark:from-matcha-900 dark:to-matcha-800 border-matcha-300 dark:border-matcha-700">
        <CardContent className="pt-6">
          <p className="text-lg sm:text-xl font-bold text-center text-matcha-800 dark:text-cream-100">
            {motivationalMessage}
          </p>
        </CardContent>
      </Card>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Time Saved vs Minimum Payments */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-matcha-100 dark:bg-matcha-800 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-matcha-700 dark:text-matcha-300" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-matcha-600 dark:text-matcha-400">
                Time Saved vs Minimum
              </h3>
              {debtFreeProjection.monthsSavedVsMinimum > 0 ? (
                <>
                  <p className="text-2xl font-bold text-matcha-700 dark:text-matcha-300">
                    {debtFreeProjection.monthsSavedVsMinimum} months
                  </p>
                  <p className="text-sm text-matcha-600 dark:text-matcha-400 flex items-center justify-center gap-1">
                    {(debtFreeProjection.monthsSavedVsMinimum / 12).toFixed(1)} years faster! <Rocket className="h-4 w-4 inline" />
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-matcha-800 dark:text-cream-100">Start saving!</p>
                  <p className="text-sm text-matcha-600 dark:text-matcha-400">Pay more to save time</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interest Savings */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-matcha-100 dark:bg-matcha-800 flex items-center justify-center">
                  <Coins className="h-6 w-6 text-matcha-700 dark:text-matcha-300" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-matcha-600 dark:text-matcha-400">
                Interest Saved vs Minimum
              </h3>
              <p className="text-2xl font-bold text-matcha-700 dark:text-matcha-300">
                ₱{interestSavings.totalInterestSavedVsMinimum.toLocaleString()}
              </p>
              <Badge variant="secondary" className="text-xs bg-matcha-200 dark:bg-matcha-700 text-matcha-800 dark:text-cream-100">
                {interestSavings.savingsPercentage.toFixed(1)}% savings
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Next Payment Due */}
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-matcha-100 dark:bg-matcha-800 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-matcha-700 dark:text-matcha-300" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-matcha-600 dark:text-matcha-400">
                Next Payment Due
              </h3>
              <p className="text-2xl font-bold text-matcha-800 dark:text-cream-100">
                {debtFreeProjection.daysUntilNextPayment} days
              </p>
              <p className="text-sm text-matcha-600 dark:text-matcha-400">
                {format(debtFreeProjection.nextPaymentDue, 'MMM d, yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar with Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-matcha-800 dark:text-cream-100">
            <TrendingUp className="h-5 w-5 text-matcha-700 dark:text-matcha-300" />
            Debt Repayment Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-matcha-800 dark:text-cream-100">{progressPercentage.toFixed(1)}% Complete</span>
              <span className="text-matcha-600 dark:text-matcha-400">
                ₱{currentPrincipal.toLocaleString()} remaining
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-matcha-200 dark:bg-matcha-800" />
          </div>

          {/* Milestones Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.percentage}
                className={`flex flex-col items-center p-2 rounded-lg border ${
                  milestone.reached
                    ? 'bg-matcha-100 dark:bg-matcha-800 border-matcha-500 dark:border-matcha-600'
                    : 'bg-cream-100 dark:bg-matcha-900 border-matcha-300 dark:border-matcha-700'
                }`}
              >
                <Trophy
                  className={`h-5 w-5 mb-1 ${
                    milestone.reached ? 'text-matcha-700 dark:text-matcha-300' : 'text-matcha-500 dark:text-matcha-500'
                  }`}
                />
                <span className={`text-xs font-semibold ${
                  milestone.reached ? 'text-matcha-800 dark:text-cream-100' : 'text-matcha-600 dark:text-matcha-400'
                }`}>
                  {milestone.percentage}%
                </span>
              </div>
            ))}
          </div>

          {nextMilestone && (
            <div className="pt-2">
              <p className="text-sm text-matcha-600 dark:text-matcha-400 text-center">
                Next milestone: <span className="font-semibold text-matcha-800 dark:text-cream-100">{nextMilestone.percentage}%</span>
                {' '}(₱{nextMilestone.remainingAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to go)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
