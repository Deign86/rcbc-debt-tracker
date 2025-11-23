interface DebtCardProps {
  totalDebt: number;
  minimumPayment: number;
  interestRate: number;
  onEdit: () => void;
}

export const DebtCard = ({ 
  totalDebt, 
  minimumPayment, 
  interestRate,
  onEdit 
}: DebtCardProps) => {
  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-6 shadow-lg text-white mx-4 mt-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-sm opacity-90 font-medium">RCBC Credit Card</p>
          <p className="text-xs opacity-75 mt-1">Total Outstanding</p>
        </div>
        <button
          onClick={onEdit}
          className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
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
      
      <div className="flex justify-between items-center pt-4 border-t border-white/20">
        <div>
          <p className="text-xs opacity-75">Minimum Payment</p>
          <p className="text-lg font-semibold">
            ₱{minimumPayment.toLocaleString('en-PH', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-75">Monthly Interest</p>
          <p className="text-lg font-semibold">{(interestRate * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};
