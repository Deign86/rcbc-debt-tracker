import { useState } from 'react';
import type { PaymentCalculation } from '../types/debt';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currency';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PaymentFormProps {
  onCalculate: (amount: number) => PaymentCalculation;
  onSubmit: (amount: number, calculation: PaymentCalculation) => void;
}

export const PaymentForm = ({ onCalculate, onSubmit }: PaymentFormProps) => {
  const [amount, setAmount] = useState('');
  const [calculation, setCalculation] = useState<PaymentCalculation | null>(null);

  const handleAmountChange = (value: string) => {
    const formatted = formatCurrencyInput(value);
    setAmount(formatted);

    const numValue = parseCurrencyInput(formatted);

    if (!isNaN(numValue) && numValue > 0) {
      const calc = onCalculate(numValue);
      setCalculation(calc);
    } else {
      setCalculation(null);
    }
  };

  const handleSubmit = () => {
    const numValue = parseCurrencyInput(amount);
    if (!isNaN(numValue) && numValue > 0 && calculation) {
      onSubmit(numValue, calculation);
      setAmount('');
      setCalculation(null);
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000];

  return (
    <Card className="mx-4 mt-6 border-matcha-300 dark:border-matcha-600">
      <CardHeader>
        <CardTitle className="text-matcha-800 dark:text-cream-100">Log Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="payment-amount" className="text-matcha-700 dark:text-matcha-200">Payment Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-matcha-500 dark:text-matcha-400 text-lg">
              ₱
            </span>
            <Input
              id="payment-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="pl-8 text-2xl font-semibold h-14 text-matcha-900 dark:text-cream-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              variant="secondary"
              size="sm"
              onClick={() => handleAmountChange(quickAmount.toString())}
              className="bg-matcha-100 dark:bg-matcha-700 hover:bg-matcha-200 dark:hover:bg-matcha-600 text-matcha-800 dark:text-cream-100"
            >
              ₱{quickAmount}
            </Button>
          ))}
        </div>

        {calculation && (
          <Card className="bg-matcha-50 dark:bg-matcha-900 border-matcha-300 dark:border-matcha-700">
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-matcha-700 dark:text-matcha-200">Interest Payment</span>
                <Badge variant="destructive" className="font-semibold">
                  ₱{calculation.interest.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-matcha-700 dark:text-matcha-200">Principal Payment</span>
                <Badge variant="default" className="bg-green-600 hover:bg-green-700 font-semibold">
                  ₱{calculation.principal.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </Badge>
              </div>
              <Separator className="bg-matcha-300 dark:bg-matcha-700" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-matcha-800 dark:text-cream-100">New Balance</span>
                <span className="text-lg font-bold text-matcha-900 dark:text-cream-50">
                  ₱{calculation.remainingBalance.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!calculation || !amount}
          className="w-full h-12 text-base font-semibold bg-matcha-600 hover:bg-matcha-700 text-cream-50"
        >
          Record Payment
        </Button>
      </CardContent>
    </Card>
  );
};
