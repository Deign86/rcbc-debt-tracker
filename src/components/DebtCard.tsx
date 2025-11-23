import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Pencil } from "lucide-react";

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
    <Card className="mx-4 mt-6 border-matcha-300 dark:border-matcha-600 bg-cream-100 dark:bg-matcha-800">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg text-matcha-800 dark:text-cream-100">Credit Card Debt</CardTitle>
            <CardDescription className="text-matcha-600 dark:text-matcha-300">Total Outstanding Balance</CardDescription>
          </div>
          <Button
            onClick={onEdit}
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-matcha-200 dark:hover:bg-matcha-700 text-matcha-600 dark:text-matcha-300"
            aria-label="Edit debt"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-5xl font-bold tracking-tight text-matcha-900 dark:text-cream-50">
          ₱{totalDebt.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </div>

        <Separator className="bg-matcha-300 dark:bg-matcha-600" />

        <div className="flex justify-between items-center">
          <Button
            onClick={onEditMinPayment}
            variant="ghost"
            className="flex flex-col items-start h-auto p-2 -ml-2 hover:bg-matcha-200 dark:hover:bg-matcha-700"
          >
            <span className="text-xs text-matcha-600 dark:text-matcha-300">Minimum Payment</span>
            <span className="text-lg font-semibold flex items-center gap-1 text-matcha-900 dark:text-cream-50">
              ₱{minimumPayment.toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
              <Pencil className="h-3 w-3 opacity-75" />
            </span>
          </Button>
          <div className="text-right">
            <p className="text-xs text-matcha-600 dark:text-matcha-300">Monthly Interest</p>
            <Badge variant="secondary" className="text-base font-semibold mt-1 bg-matcha-200 dark:bg-matcha-700 text-matcha-800 dark:text-cream-100">
              {(interestRate * 100).toFixed(1)}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
