import { useState, useEffect } from 'react';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currency';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditDebtSheetProps {
  isOpen: boolean;
  currentAmount: number;
  onClose: () => void;
  onSave: (newAmount: number, note: string) => void;
}

export const EditDebtSheet = ({
  isOpen,
  currentAmount,
  onClose,
  onSave
}: EditDebtSheetProps) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount(currentAmount.toString());
      setNote('');
    }
  }, [isOpen, currentAmount]);

  const handleAmountChange = (value: string) => {
    const formatted = formatCurrencyInput(value);
    setAmount(formatted);
  };

  const handleSave = () => {
    const numValue = parseCurrencyInput(amount);
    if (!isNaN(numValue) && numValue > 0) {
      onSave(numValue, note || 'Manual adjustment');
      onClose();
    }
  };

  const isValid = () => {
    const numValue = parseCurrencyInput(amount);
    return !isNaN(numValue) && numValue > 0;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-w-2xl mx-auto glass-strong rounded-t-2xl border-t-0">
        <SheetHeader>
          <SheetTitle className="text-foreground">Adjust Debt Amount</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Update your principal debt amount
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-6">
          <div className="space-y-2">
            <Label htmlFor="debt-amount" className="text-muted-foreground">New Principal Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl font-medium">
                ₱
              </span>
              <Input
                id="debt-amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className="pl-10 text-2xl font-semibold h-14 text-foreground glass-input border-white/20 dark:border-white/10 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors rounded-xl"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-muted-foreground">Note (Optional)</Label>
            <Input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Statement adjustment, Error correction"
              className="text-foreground glass-input border-white/20 dark:border-white/10 rounded-xl"
            />
          </div>
        </div>

        <SheetFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 glass-button border-white/20 dark:border-white/10 text-muted-foreground hover:text-foreground cursor-pointer rounded-xl">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isValid()} 
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg transition-colors">
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
