import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Pencil, CreditCard, TrendingDown } from "lucide-react";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle, GlassCardDescription } from "@/components/ui/glass-card";

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
    <GlassCard 
      variant="strong" 
      className="overflow-hidden relative h-full flex flex-col"
    >
      <GlassCardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="glass-primary p-2.5 rounded-xl">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <GlassCardTitle className="text-lg font-semibold text-foreground">Credit Card Debt</GlassCardTitle>
            </div>
            <GlassCardDescription className="text-muted-foreground">Total Outstanding Balance</GlassCardDescription>
          </div>
          <Button
            onClick={onEdit}
            variant="ghost"
            size="icon"
            className="h-10 w-10 glass-subtle rounded-xl text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            aria-label="Edit debt"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </GlassCardHeader>

      <GlassCardContent className="space-y-6 flex-1 flex flex-col">
        <div className="space-y-2">
          <div className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            ₱{totalDebt.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="glass-primary p-1 rounded-lg">
              <TrendingDown className="h-3.5 w-3.5 text-primary" />
            </div>
            <span>Pay down your balance to save on interest</span>
          </div>
        </div>

        <Separator className="bg-white/20 dark:bg-white/10" />

        <div className="grid grid-cols-2 gap-3 mt-auto">
          <Button
            onClick={onEditMinPayment}
            variant="ghost"
            className="flex flex-col items-start h-auto p-3 glass-button rounded-xl group cursor-pointer"
          >
            <span className="text-xs text-muted-foreground">Minimum Payment</span>
            <span className="text-lg font-semibold flex items-center gap-1.5 text-foreground group-hover:text-primary transition-colors">
              ₱{minimumPayment.toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
              <Pencil className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            </span>
          </Button>
          <div className="glass-subtle p-3 rounded-xl flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground mb-1.5">Monthly Interest</p>
            <Badge 
              variant="secondary" 
              className="text-base font-semibold glass-primary text-primary border-0 px-4 py-1.5 rounded-lg"
            >
              {(interestRate * 100).toFixed(1)}%
            </Badge>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
};
