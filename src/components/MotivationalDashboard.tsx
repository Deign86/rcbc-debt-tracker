import type { MilestoneData, InterestSavingsData, DebtFreeProjection } from '../utils/debtMotivation';
import { format } from 'date-fns';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Coins, Clock, TrendingUp, Trophy, Rocket } from "lucide-react";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";

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
      <GlassCard variant="primary" className="overflow-hidden relative">
        <GlassCardContent className="py-6 relative">
          <p className="text-lg sm:text-xl font-semibold text-center text-foreground">
            {motivationalMessage}
          </p>
        </GlassCardContent>
      </GlassCard>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Time Saved vs Minimum Payments */}
        <GlassCard variant="subtle">
          <GlassCardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-14 h-14 glass-primary rounded-2xl flex items-center justify-center">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                Time Saved vs Minimum
              </h3>
              {debtFreeProjection.monthsSavedVsMinimum > 0 ? (
                <>
                  <p className="text-2xl font-bold text-primary">
                    {debtFreeProjection.monthsSavedVsMinimum} months
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    {(debtFreeProjection.monthsSavedVsMinimum / 12).toFixed(1)} years faster! <Rocket className="h-4 w-4 inline text-primary" />
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-foreground">Start saving!</p>
                  <p className="text-sm text-muted-foreground">Pay more to save time</p>
                </>
              )}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Interest Savings */}
        <GlassCard variant="subtle">
          <GlassCardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-14 h-14 glass-primary rounded-2xl flex items-center justify-center">
                  <Coins className="h-7 w-7 text-primary" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                Interest Saved vs Minimum
              </h3>
              <p className="text-2xl font-bold text-primary">
                ₱{interestSavings.totalInterestSavedVsMinimum.toLocaleString()}
              </p>
              <Badge variant="secondary" className="text-xs glass-primary text-primary border-0 rounded-lg px-3 py-1">
                {interestSavings.savingsPercentage.toFixed(1)}% savings
              </Badge>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Next Payment Due */}
        <GlassCard variant="subtle" className="sm:col-span-2 lg:col-span-1">
          <GlassCardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-14 h-14 glass-primary rounded-2xl flex items-center justify-center">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                Next Payment Due
              </h3>
              <p className="text-2xl font-bold text-foreground">
                {debtFreeProjection.daysUntilNextPayment} days
              </p>
              <p className="text-sm text-muted-foreground">
                {format(debtFreeProjection.nextPaymentDue, 'MMM d, yyyy')}
              </p>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Progress Bar with Milestones */}
      <GlassCard variant="default">
        <GlassCardHeader>
          <GlassCardTitle className="flex items-center gap-2 text-foreground">
            <div className="glass-primary p-2 rounded-xl">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            Debt Repayment Progress
          </GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">{progressPercentage.toFixed(1)}% Complete</span>
              <span className="text-muted-foreground">
                ₱{currentPrincipal.toLocaleString()} remaining
              </span>
            </div>
            <div className="glass-subtle rounded-full p-1">
              <Progress value={progressPercentage} className="h-3 bg-transparent" />
            </div>
          </div>

          {/* Milestones Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.percentage}
                className={`flex flex-col items-center p-3 rounded-xl transition-colors cursor-pointer ${
                  milestone.reached
                    ? 'glass-primary'
                    : 'glass-subtle hover:glass'
                }`}
              >
                <Trophy
                  className={`h-5 w-5 mb-1 ${
                    milestone.reached ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                <span className={`text-xs font-semibold ${
                  milestone.reached ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {milestone.percentage}%
                </span>
              </div>
            ))}
          </div>

          {nextMilestone && (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground text-center">
                Next milestone: <span className="font-semibold text-primary">{nextMilestone.percentage}%</span>
                {' '}(₱{nextMilestone.remainingAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to go)
              </p>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
    </div>
  );
};
