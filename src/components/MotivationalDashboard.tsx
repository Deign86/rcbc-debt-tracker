import { useTheme } from '../contexts/ThemeContext';
import type { MilestoneData, InterestSavingsData, DebtFreeProjection } from '../utils/debtMotivation';
import { format } from 'date-fns';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const progressPercentage = ((initialDebt - currentPrincipal) / initialDebt) * 100;
  const nextMilestone = milestones.find(m => !m.reached);

  return (
    <div className="space-y-4">
      {/* Motivational Message */}
      <div className={`
        ${isDark ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50' : 'bg-gradient-to-r from-blue-50 to-purple-50'}
        rounded-xl p-6 text-center border
        ${isDark ? 'border-blue-800' : 'border-blue-200'}
      `}>
        <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {motivationalMessage}
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Time Saved vs Minimum Payments */}
        <div className={`
          ${isDark ? 'bg-gray-800' : 'bg-white'}
          rounded-xl p-6 shadow-lg border
          ${isDark ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="text-center">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Time Saved vs Minimum
            </h3>
            {debtFreeProjection.monthsSavedVsMinimum > 0 ? (
              <>
                <p className={`text-2xl font-bold text-green-500`}>
                  {debtFreeProjection.monthsSavedVsMinimum} months
                </p>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {(debtFreeProjection.monthsSavedVsMinimum / 12).toFixed(1)} years faster! 🚀
                </p>
              </>
            ) : (
              <>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Start saving!
                </p>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Pay more to save time
                </p>
              </>
            )}
          </div>
        </div>

        {/* Interest Savings */}
        <div className={`
          ${isDark ? 'bg-gray-800' : 'bg-white'}
          rounded-xl p-6 shadow-lg border
          ${isDark ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="text-center">
            <div className="text-4xl mb-2">💰</div>
            <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Interest Saved vs Minimum
            </h3>
            <p className={`text-2xl font-bold text-green-500`}>
              ₱{interestSavings.totalInterestSavedVsMinimum.toLocaleString()}
            </p>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {interestSavings.savingsPercentage.toFixed(1)}% savings
            </p>
          </div>
        </div>

        {/* Next Payment Due */}
        <div className={`
          ${isDark ? 'bg-gray-800' : 'bg-white'}
          rounded-xl p-6 shadow-lg border
          ${isDark ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="text-center">
            <div className="text-4xl mb-2">⏰</div>
            <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Next Payment Due
            </h3>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {debtFreeProjection.daysUntilNextPayment} days
            </p>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {format(debtFreeProjection.nextPaymentDue, 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar with Milestones */}
      <div className={`
        ${isDark ? 'bg-gray-800' : 'bg-white'}
        rounded-xl p-6 shadow-lg border
        ${isDark ? 'border-gray-700' : 'border-gray-200'}
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Debt Repayment Progress
        </h3>
        
        {/* Progress Bar */}
        <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out flex items-center justify-end pr-2"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          >
            {progressPercentage > 5 && (
              <span className="text-white text-sm font-bold">
                {progressPercentage.toFixed(1)}%
              </span>
            )}
          </div>
          
          {/* Milestone Markers */}
          {milestones.map((milestone) => (
            <div
              key={milestone.percentage}
              className="absolute top-0 h-full flex items-center justify-center"
              style={{ left: `${milestone.percentage}%` }}
            >
              <div className={`
                w-0.5 h-full
                ${milestone.reached ? 'bg-green-500' : 'bg-gray-400'}
              `} />
            </div>
          ))}
        </div>

        {/* Milestone Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.percentage}
              className={`
                p-3 rounded-lg border-2 transition-all
                ${milestone.reached
                  ? isDark
                    ? 'bg-green-900/30 border-green-500'
                    : 'bg-green-50 border-green-500'
                  : isDark
                  ? 'bg-gray-700/50 border-gray-600'
                  : 'bg-gray-50 border-gray-300'
                }
              `}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {milestone.reached ? '✅' : '⭕'}
                </div>
                <p className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {milestone.label}
                </p>
                {!milestone.reached && (
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    ₱{milestone.remainingAmount.toLocaleString()} to go
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Next Milestone Info */}
        {nextMilestone && (
          <div className={`
            mt-4 p-4 rounded-lg
            ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}
            border
            ${isDark ? 'border-blue-800' : 'border-blue-200'}
          `}>
            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              <span className="font-semibold">Next Milestone:</span> {nextMilestone.label} - 
              Only ₱{nextMilestone.remainingAmount.toLocaleString()} away!
            </p>
          </div>
        )}
      </div>

      {/* Interest Details */}
      <div className={`
        ${isDark ? 'bg-gray-800' : 'bg-white'}
        rounded-xl p-6 shadow-lg border
        ${isDark ? 'border-gray-700' : 'border-gray-200'}
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Interest Breakdown
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Total Interest Paid
            </span>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              ₱{interestSavings.totalInterestPaid.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Interest Saved
            </span>
            <span className="font-semibold text-green-500">
              ₱{interestSavings.totalInterestSavedVsMinimum.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Projected Total (Minimum Only)
            </span>
            <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              ₱{interestSavings.projectedInterestIfMinimumOnly.toLocaleString()}
            </span>
          </div>

          <div className={`
            pt-3 mt-3 border-t
            ${isDark ? 'border-gray-700' : 'border-gray-200'}
          `}>
            <div className="flex justify-between items-center">
              <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Average Monthly Payment
              </span>
              <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ₱{debtFreeProjection.averageMonthlyPayment.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
