import { useState } from 'react';
import type { PaymentCalculation } from '../types/debt';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currency';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet, ArrowDownRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";

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
    <GlassCard variant="default" className="mx-4 mt-6">
      <GlassCardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="glass-primary p-2.5 rounded-xl">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <GlassCardTitle className="text-foreground font-semibold">Log Payment</GlassCardTitle>
        </div>
      </GlassCardHeader>
      <GlassCardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="payment-amount" className="text-muted-foreground text-sm">Payment Amount</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl font-medium">
              ₱
            </span>
            <Input
              id="payment-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="pl-10 text-2xl font-semibold h-14 text-foreground glass-input border-white/20 dark:border-white/10 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              variant="outline"
              size="sm"
              onClick={() => handleAmountChange(quickAmount.toString())}
              className="glass-button hover:glass-primary text-foreground border-white/20 dark:border-white/10 cursor-pointer"
            >
              ₱{quickAmount.toLocaleString()}
            </Button>
          ))}
        </div>

        {calculation && (
          <GlassCard variant="subtle" className="overflow-hidden animate-fade-in">
            <GlassCardContent className="pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-destructive/10">
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Interest Payment</span>
                </div>
                <Badge variant="destructive" className="font-semibold rounded-lg px-3 py-1">
                  ₱{calculation.interest.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-green-600/10">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Principal Payment</span>
                </div>
                <Badge className="bg-green-600 hover:bg-green-700 font-semibold border-0 rounded-lg px-3 py-1">
                  ₱{calculation.principal.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </Badge>
              </div>
              <Separator className="bg-white/20 dark:bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-foreground">New Balance</span>
                <span className="text-lg font-bold text-foreground">
                  ₱{calculation.remainingBalance.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!calculation || !amount}
          className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          Record Payment
        </Button>
      </GlassCardContent>
    </GlassCard>
  );
};
