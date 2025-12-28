import { useState } from 'react';
import { Budget } from '@/types/grocery';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Pencil, RotateCcw } from 'lucide-react';

interface BudgetTrackerProps {
  budget: Budget;
  onBudgetChange: (limit: number) => void;
  onBudgetReset: () => void;
}

const DEFAULT_BUDGET = 1000;

export const BudgetTracker = ({ budget, onBudgetChange, onBudgetReset }: BudgetTrackerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budget.limit.toString());
  
  const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
  const remaining = Math.max(budget.limit - budget.spent, 0);
  const isOverBudget = budget.spent > budget.limit;
  const isNearLimit = percentage >= 80 && !isOverBudget;

  const handleBudgetClick = () => {
    setBudgetInput(budget.limit.toString());
    setIsEditing(true);
  };

  const handleBudgetSubmit = () => {
    const newLimit = parseFloat(budgetInput);
    if (!isNaN(newLimit) && newLimit > 0) {
      onBudgetChange(newLimit);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBudgetSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleReset = () => {
    onBudgetReset();
    setBudgetInput(DEFAULT_BUDGET.toString());
  };

  return (
    <div className="ios-card p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Monthly Budget</span>
          {(budget.limit !== DEFAULT_BUDGET || budget.accumulated > 0) && (
            <button
              onClick={handleReset}
              className="p-1 rounded-full hover:bg-secondary transition-colors"
              title="Reset to ₹1000"
            >
              <RotateCcw className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
            </button>
          )}
        </div>
        <span className={cn(
          "text-xs font-bold px-3 py-1.5 rounded-full shadow-sm",
          isOverBudget 
            ? "bg-destructive/15 text-destructive" 
            : isNearLimit 
              ? "bg-warning/15 text-warning" 
              : "bg-primary/15 text-primary"
        )}>
          {isOverBudget ? "Over Budget" : isNearLimit ? "Almost There" : "On Track"}
        </span>
      </div>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-extrabold text-foreground">₹{budget.spent.toFixed(2)}</span>
        <span className="text-muted-foreground text-sm font-medium">/ </span>
        {isEditing ? (
          <Input
            type="number"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            onBlur={handleBudgetSubmit}
            onKeyDown={handleKeyDown}
            className="w-24 h-8 text-sm px-2"
            min="0"
            autoFocus
          />
        ) : (
          <button
            onClick={handleBudgetClick}
            className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
          >
            ₹{budget.limit.toFixed(0)}
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="h-3 bg-secondary rounded-full overflow-hidden mt-3 shadow-inner">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            isOverBudget 
              ? "bg-gradient-to-r from-destructive to-destructive/80" 
              : isNearLimit 
                ? "bg-gradient-to-r from-warning to-warning/80" 
                : "premium-gradient"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-sm text-muted-foreground mt-3 font-medium">
        {isOverBudget 
          ? `₹${(budget.spent - budget.limit).toFixed(2)} over budget` 
          : `₹${remaining.toFixed(2)} remaining`}
      </p>
    </div>
  );
};