import { useState, useEffect, useRef } from 'react';
import { DebtCard } from '../components/DebtCard';
import { PaymentForm } from '../components/PaymentForm';
import { EditDebtSheet } from '../components/EditDebtSheet';
import { EditMinPaymentSheet } from '../components/EditMinPaymentSheet';
import { ResetModal } from '../components/ResetModal';
import { CelebrationAnimation } from '../components/CelebrationAnimation';
import { MotivationalDashboard } from '../components/MotivationalDashboard';
import { useDebtCalculator } from '../hooks/useDebtCalculator';
import { RotateCcw, CreditCard, Edit3 } from 'lucide-react';
import {
  saveDebtState,
  loadDebtState,
  savePayment,
  subscribeToPayments,
  resetAllData,
  saveMilestoneAchievement,
  markMilestoneCelebrated,
  loadMilestoneAchievements,
} from '../services/firestoreService';
import { CacheService } from '../services/cacheService';
import { BILLING_CONSTANTS, getNextDueDate } from '../config/billingConstants';
import {
  calculateMilestones,
  calculateInterestSavings,
  projectDebtFreeDate,
  getMotivationalMessage,
  checkNewMilestone,
} from '../utils/debtMotivation';
import type { Payment, MilestoneAchievement } from '../types/debt';

export const Dashboard = () => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMinPaymentEditOpen, setIsMinPaymentEditOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievedMilestones, setAchievedMilestones] = useState<MilestoneAchievement[]>([]);
  const [celebrationMilestone, setCelebrationMilestone] = useState<number | null>(null);
  const [initialDebtState, setInitialDebtState] = useState<{
    currentPrincipal: number;
    minimumPayment: number;
  } | null>(null);
  const previousPrincipalRef = useRef<number>(BILLING_CONSTANTS.INITIAL_DEBT);

  const {
    debtState,
    calculatePayment,
    applyPayment,
    adjustPrincipal,
    updateMinimumPayment,
    monthlyRate,
  } = useDebtCalculator({
    currentPrincipal: initialDebtState?.currentPrincipal ?? BILLING_CONSTANTS.INITIAL_DEBT,
    interestRate: BILLING_CONSTANTS.MONTHLY_INTEREST_RATE,
    minimumPayment: initialDebtState?.minimumPayment ?? BILLING_CONSTANTS.INITIAL_MIN_PAYMENT,
    statementDate: new Date(),
    dueDate: getNextDueDate(),
  });

  // Load debt state, payments, and milestones from Firestore on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedDebtState, milestones] = await Promise.all([
          loadDebtState(),
          loadMilestoneAchievements(),
        ]);

        if (savedDebtState) {
          // Set initial state first (this will cause useDebtCalculator to reinitialize)
          setInitialDebtState({
            currentPrincipal: savedDebtState.currentPrincipal,
            minimumPayment: savedDebtState.minimumPayment,
          });
          adjustPrincipal(savedDebtState.currentPrincipal);
          updateMinimumPayment(savedDebtState.minimumPayment);
          previousPrincipalRef.current = savedDebtState.currentPrincipal;
        } else {
          // No saved state, use initial values
          setInitialDebtState({
            currentPrincipal: BILLING_CONSTANTS.INITIAL_DEBT,
            minimumPayment: BILLING_CONSTANTS.INITIAL_MIN_PAYMENT,
          });
        }

        setAchievedMilestones(milestones);

        // Check if there's an uncelebrated milestone
        const uncelebrated = milestones.find(m => !m.celebrated);
        if (uncelebrated) {
          setCelebrationMilestone(uncelebrated.milestone);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [adjustPrincipal, updateMinimumPayment]);

  // Subscribe to real-time payment updates
  useEffect(() => {
    const unsubscribe = subscribeToPayments(50, (updatedPayments) => {
      setPayments(updatedPayments);
    });

    return () => unsubscribe();
  }, []);

  // Save debt state to Firestore whenever it changes
  useEffect(() => {
    if (!loading) {
      saveDebtState(debtState).catch(error => {
        console.error('Error saving debt state:', error);
      });
    }
  }, [debtState, loading]);

  const handlePaymentSubmit = async (amount: number, calculation: any) => {
    try {
      const previousPrincipal = debtState.currentPrincipal;

      // Log for debugging
      console.log('Payment submission:', {
        previousPrincipal,
        newBalance: calculation.remainingBalance,
        previousProgress: ((BILLING_CONSTANTS.INITIAL_DEBT - previousPrincipal) / BILLING_CONSTANTS.INITIAL_DEBT * 100).toFixed(2) + '%',
        newProgress: ((BILLING_CONSTANTS.INITIAL_DEBT - calculation.remainingBalance) / BILLING_CONSTANTS.INITIAL_DEBT * 100).toFixed(2) + '%',
      });

      const newPayment = {
        amount,
        date: new Date(),
        principal: calculation.principal,
        interest: calculation.interest,
        type: 'payment' as const,
      };

      await savePayment(newPayment);
      applyPayment(amount);

      // Check if a new milestone was reached (non-blocking)
      const newMilestone = checkNewMilestone(
        previousPrincipal,
        calculation.remainingBalance,
        BILLING_CONSTANTS.INITIAL_DEBT
      );

      if (newMilestone?.reached) {
        // Check if this milestone was already achieved (avoid duplicates)
        const alreadyAchieved = achievedMilestones.some(m => m.milestone === newMilestone.milestone);

        if (!alreadyAchieved) {
          console.log(`🎉 Milestone reached: ${newMilestone.milestone}%`);

          // Show celebration IMMEDIATELY (don't wait for save)
          setCelebrationMilestone(newMilestone.milestone);

          // Save the milestone achievement in background (non-blocking)
          saveMilestoneAchievement({
            milestone: newMilestone.milestone,
            achievedDate: new Date(),
            principalAtAchievement: calculation.remainingBalance,
          }).then(() => {
            console.log(`✅ Milestone ${newMilestone.milestone}% saved to Firestore`);
            // Update achieved milestones list after successful save
            return loadMilestoneAchievements();
          }).then((updatedMilestones) => {
            setAchievedMilestones(updatedMilestones);
          }).catch((error) => {
            console.error('Error saving milestone (non-critical):', error);
            // Celebration already shown, so just log the error
            // Add to local state even if save failed
            setAchievedMilestones(prev => [...prev, {
              milestone: newMilestone.milestone,
              achievedDate: new Date(),
              principalAtAchievement: calculation.remainingBalance,
              celebrated: false,
            }]);
          });
        } else {
          console.log(`Milestone ${newMilestone.milestone}% already achieved, skipping celebration`);
        }
      }

      previousPrincipalRef.current = calculation.remainingBalance;
    } catch (error) {
      console.error('Error submitting payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to save payment: ${errorMessage}. Please check your connection and try again.`);
    }
  };

  const handleDebtAdjustment = async (newAmount: number, note: string) => {
    try {
      const adjustment = {
        amount: newAmount - debtState.currentPrincipal,
        date: new Date(),
        principal: newAmount - debtState.currentPrincipal,
        interest: 0,
        type: 'adjustment' as const,
        note,
      };

      await savePayment(adjustment);
      adjustPrincipal(newAmount);
    } catch (error) {
      console.error('Error adjusting debt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to save adjustment: ${errorMessage}. Please check your connection and try again.`);
    }
  };

  const handleResetConfirm = async () => {
    try {
      await resetAllData();
      CacheService.clearAll();
      setIsResetModalOpen(false);
      // Reload the page to reset all state
      window.location.reload();
    } catch (error) {
      console.error('Error resetting data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to reset data: ${errorMessage}. Please check your connection and try again.`);
      setIsResetModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-matcha-600 mx-auto mb-4"></div>
          <p className="text-matcha-700 dark:text-cream-300">Loading your debt data...</p>
        </div>
      </div>
    );
  }

  // Calculate motivational data
  const milestones = calculateMilestones(debtState.currentPrincipal, BILLING_CONSTANTS.INITIAL_DEBT);
  const interestSavings = calculateInterestSavings(payments, debtState.currentPrincipal, BILLING_CONSTANTS.INITIAL_DEBT);
  const debtFreeProjection = projectDebtFreeDate(payments, debtState.currentPrincipal, debtState.minimumPayment);
  const progressPercentage = ((BILLING_CONSTANTS.INITIAL_DEBT - debtState.currentPrincipal) / BILLING_CONSTANTS.INITIAL_DEBT) * 100;
  const motivationalMessage = getMotivationalMessage(progressPercentage);

  const handleCelebrationComplete = async () => {
    if (celebrationMilestone) {
      await markMilestoneCelebrated(celebrationMilestone);
      const updatedMilestones = await loadMilestoneAchievements();
      setAchievedMilestones(updatedMilestones);
    }
    setCelebrationMilestone(null);
  };

  return (
    <div className="pb-4 xxs:pb-5 sm:pb-6">
      {/* Celebration Animation */}
      {celebrationMilestone && (
        <CelebrationAnimation
          milestone={celebrationMilestone}
          onComplete={handleCelebrationComplete}
        />
      )}

      {/* Header - Mobile Only */}
      <div className="lg:hidden bg-matcha-500 dark:bg-matcha-800 shadow-sm sticky top-0 z-10">
        <div className="px-3 xxs:px-4 sm:px-5 md:px-6 py-3 xxs:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 xxs:gap-3">
            <img src="https://firebasestorage.googleapis.com/v0/b/rcbc-debt-tracker-app.firebasestorage.app/o/assets%2Flogo.webp?alt=media&token=41fd0341-26dd-4553-a74c-2992068efe69" alt="Debt Repayment Logo" className="w-8 xxs:w-10 h-8 xxs:h-10 object-contain" />
            <div>
              <h1 className="text-xl xxs:text-2xl sm:text-3xl font-bold text-white dark:text-cream-50">Debt Tracker</h1>
              <p className="text-xs xxs:text-sm text-white/80 dark:text-cream-100/80">Financial Freedom Journey</p>
            </div>
          </div>
          {/* Mobile Reset Button */}
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="lg:hidden px-2 xxs:px-3 py-1 xxs:py-1.5 text-xs xxs:text-sm bg-cream-100 dark:bg-matcha-900 text-matcha-800 dark:text-cream-200 rounded-lg hover:bg-cream-200 dark:hover:bg-matcha-700 transition-colors font-medium border border-matcha-300 dark:border-matcha-600 flex items-center gap-1"
            title="Reset all data"
          >
            <RotateCcw className="h-3 w-3 xxs:h-4 xxs:w-4" /> <span className="hidden xxs:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Dashboard Grid Container */}
      <div className="mx-3 xxs:mx-4 sm:mx-5 md:mx-6 mt-4 xxs:mt-5 sm:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 xxs:gap-5 sm:gap-6">

        {/* Motivational Dashboard - Full width on lg, 8 cols on xl */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-4 xxs:space-y-5 sm:space-y-6">
          <MotivationalDashboard
            milestones={milestones}
            interestSavings={interestSavings}
            debtFreeProjection={debtFreeProjection}
            currentPrincipal={debtState.currentPrincipal}
            initialDebt={BILLING_CONSTANTS.INITIAL_DEBT}
            motivationalMessage={motivationalMessage}
          />

          {/* Debt Card & Payment Form Container - Responsive grid */}
          <div className="grid grid-cols-1 md-plus:grid-cols-2 gap-4 xxs:gap-5 sm:gap-6">
            <DebtCard
              totalDebt={debtState.currentPrincipal}
              minimumPayment={debtState.minimumPayment}
              interestRate={monthlyRate}
              onEdit={() => setIsEditOpen(true)}
              onEditMinPayment={() => setIsMinPaymentEditOpen(true)}
            />

            <PaymentForm
              onCalculate={calculatePayment}
              onSubmit={handlePaymentSubmit}
            />
          </div>
        </div>

        {/* Recent Activity - Full width on lg, 4 cols on xl (Side panel) */}
        <div className="lg:col-span-12 xl:col-span-4">
          {payments.length > 0 ? (
            <div className="h-full">
              <h3 className="text-base xxs:text-lg font-semibold text-matcha-800 dark:text-cream-100 mb-2 xxs:mb-3">Recent Activity</h3>
              <div className="bg-cream-50 dark:bg-matcha-800 rounded-lg xxs:rounded-xl shadow-md overflow-hidden border border-matcha-200 dark:border-matcha-600 h-full max-h-[500px] sm:max-h-[600px] xl:max-h-[700px] overflow-y-auto">
                {payments.slice(0, 10).map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 border-b border-matcha-200 dark:border-matcha-700 last:border-b-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-matcha-800 dark:text-cream-100 flex items-center gap-2">
                          {payment.type === 'payment' ? <><CreditCard className="h-4 w-4" /> Payment</> : <><Edit3 className="h-4 w-4" /> Adjustment</>}
                        </p>
                        <p className="text-sm text-matcha-600 dark:text-cream-300 mt-1">
                          {payment.date.toLocaleDateString('en-PH', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        {payment.note && (
                          <p className="text-xs text-matcha-500 dark:text-cream-400 mt-1">{payment.note}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-matcha-800 dark:text-cream-100">
                          ₱{Math.abs(payment.amount).toLocaleString('en-PH', {
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        {payment.type === 'payment' && (
                          <div className="text-xs mt-1 space-y-0.5">
                            <p className="text-green-600">
                              Principal: ₱{payment.principal.toFixed(2)}
                            </p>
                            <p className="text-red-600">
                              Interest: ₱{payment.interest.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="hidden xl:block bg-matcha-50 dark:bg-matcha-900/50 rounded-xl border-2 border-dashed border-matcha-200 dark:border-matcha-700 p-8 text-center h-full flex flex-col items-center justify-center text-matcha-600 dark:text-matcha-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Debt Sheet */}
      <EditDebtSheet
        isOpen={isEditOpen}
        currentAmount={debtState.currentPrincipal}
        onClose={() => setIsEditOpen(false)}
        onSave={handleDebtAdjustment}
      />

      {/* Edit Minimum Payment Sheet */}
      <EditMinPaymentSheet
        isOpen={isMinPaymentEditOpen}
        currentMinPayment={debtState.minimumPayment}
        onClose={() => setIsMinPaymentEditOpen(false)}
        onSave={updateMinimumPayment}
      />

      {/* Reset Modal */}
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
      />
    </div>
  );
};

