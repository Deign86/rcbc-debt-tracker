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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-w-2xl mx-auto bg-cream-50 dark:bg-matcha-900">
        <SheetHeader>
          <SheetTitle className="text-matcha-800 dark:text-cream-100">Edit Minimum Payment</SheetTitle>
          <SheetDescription className="text-matcha-600 dark:text-matcha-300">
            Update the minimum payment amount for accurate calculations
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-6">
          <div className="space-y-2">
            <Label htmlFor="min-payment" className="text-matcha-700 dark:text-matcha-200">Minimum Payment Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-matcha-500 dark:text-matcha-400 text-lg">
                ₱
              </span>
              <Input
                id="min-payment"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className="pl-8 text-2xl font-semibold h-14 text-matcha-900 dark:text-cream-50"
                autoFocus
              />
            </div>
          </div>

          <Alert className="bg-matcha-100 dark:bg-matcha-800 border-matcha-300 dark:border-matcha-700">
            <Lightbulb className="h-4 w-4 text-matcha-700 dark:text-matcha-300" />
            <AlertDescription className="text-matcha-700 dark:text-matcha-200">
              RCBC calculates minimum as 5% of balance or ₱500, whichever is higher
            </AlertDescription>
          </Alert>
        </div>

        <SheetFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="flex-1 border-matcha-300 dark:border-matcha-600 text-matcha-700 dark:text-matcha-200 hover:bg-matcha-100 dark:hover:bg-matcha-800">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-matcha-600 hover:bg-matcha-700 text-cream-50">
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
