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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";

interface EditMinPaymentSheetProps {
  isOpen: boolean;
  currentMinPayment: number;
  onClose: () => void;
  onSave: (newMinPayment: number) => void;
}

export const EditMinPaymentSheet = ({
  isOpen,
  currentMinPayment,
  onClose,
  onSave
}: EditMinPaymentSheetProps) => {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount(currentMinPayment.toString());
    }
  }, [isOpen, currentMinPayment]);

  const handleAmountChange = (value: string) => {
    const formatted = formatCurrencyInput(value);
    setAmount(formatted);
  };

  const handleSave = () => {
    const numValue = parseCurrencyInput(amount);
    if (!isNaN(numValue) && numValue > 0) {
      onSave(numValue);
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
          <SheetTitle className="text-foreground">Edit Minimum Payment</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Update the minimum payment amount for accurate calculations
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-6">
          <div className="space-y-2">
            <Label htmlFor="min-payment" className="text-muted-foreground">Minimum Payment Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl font-medium">
                ₱
              </span>
              <Input
                id="min-payment"
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

          <Alert className="glass-primary border-primary/30 rounded-xl">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              RCBC calculates minimum as 5% of balance or ₱500, whichever is higher
            </AlertDescription>
          </Alert>
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
