interface DebtCardProps {
  totalDebt: number;
  minimumPayment: number;
  interestRate: number;
  onEdit: () => void;
  onEditMinPayment: () => void;
}

export const DebtCard = ({
  totalDebt,
  minimumPayment,
  interestRate,
  onEdit,
  onEditMinPayment
}: DebtCardProps) => {
  return (
    <div className="bg-cream-50 dark:bg-matcha-800 rounded-3xl p-6 shadow-lg text-matcha-800 dark:text-cream-50 mx-4 mt-6 border-2 border-matcha-200 dark:border-matcha-600">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-sm opacity-90 font-medium">Credit Card Debt</p>
          <p className="text-xs opacity-75 mt-1">Total Outstanding</p>
        </div>
        <button
          onClick={onEdit}
          className="p-2 rounded-full hover:bg-matcha-100 dark:hover:bg-matcha-700 active:bg-matcha-200 dark:active:bg-matcha-600 transition-colors text-matcha-600 dark:text-matcha-300"
          aria-label="Edit debt"
        >
          <span className="text-xl">✏️</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="text-5xl font-bold tracking-tight">
          ₱{totalDebt.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-matcha-200 dark:border-matcha-600">
        <button
          onClick={onEditMinPayment}
          className="flex flex-col hover:bg-matcha-100 dark:hover:bg-matcha-700 active:bg-matcha-200 dark:active:bg-matcha-600 rounded-lg p-2 -ml-2 transition-colors"
        >
          <p className="text-xs opacity-75">Minimum Payment</p>
          <p className="text-lg font-semibold flex items-center gap-1">
            ₱{minimumPayment.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
            <span className="text-sm opacity-75">✏️</span>
          </p>
        </button>
        <div className="text-right">
          <p className="text-xs opacity-75">Monthly Interest</p>
          <p className="text-lg font-semibold">{(interestRate * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};
