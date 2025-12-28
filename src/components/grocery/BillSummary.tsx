import { BillCalculation } from '@/types/grocery';
import { Input } from '@/components/ui/input';

interface BillSummaryProps {
  calculation: BillCalculation;
  taxRate: number;
  discountPercent: number;
  onTaxChange: (rate: number) => void;
  onDiscountChange: (percent: number) => void;
  itemCount: number;
}

export const BillSummary = ({ 
  calculation, 
  taxRate, 
  discountPercent,
  onTaxChange,
  onDiscountChange,
  itemCount 
}: BillSummaryProps) => {
  return (
    <div className="ios-card p-5 animate-slide-up">
      <h2 className="font-bold text-foreground text-lg mb-4">Summary</h2>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
          <span className="font-medium text-foreground">₹{calculation.subtotal.toFixed(2)}</span>
        </div>

        {/* Discount */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Discount</span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={discountPercent}
              onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
              className="w-16 h-8 text-center text-sm rounded-xl bg-secondary border-0 shadow-sm"
              min="0"
              max="100"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>

        {calculation.discountAmount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-primary font-medium">You save</span>
            <span className="font-semibold text-primary">-₹{calculation.discountAmount.toFixed(2)}</span>
          </div>
        )}

        {/* Tax */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Tax</span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={taxRate}
              onChange={(e) => onTaxChange(parseFloat(e.target.value) || 0)}
              className="w-16 h-8 text-center text-sm rounded-xl bg-secondary border-0 shadow-sm"
              min="0"
              max="100"
              step="0.1"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Tax amount</span>
          <span className="text-foreground">+₹{calculation.taxAmount.toFixed(2)}</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-3" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-bold text-foreground text-lg">Total</span>
          <span className="text-2xl font-extrabold premium-gradient-text">₹{calculation.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};