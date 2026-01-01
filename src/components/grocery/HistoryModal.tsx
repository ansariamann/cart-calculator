import { useState } from 'react';
import { ArrowLeft, Trash2, Receipt, Calendar, ShoppingBag, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/grocery';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { SwipeableItem } from './SwipeableItem';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onRemoveTransaction: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryModal = ({
  isOpen,
  onClose,
  transactions,
  onRemoveTransaction,
  onToggleBookmark,
  onClearHistory,
}: HistoryModalProps) => {
  const [showBookmarked, setShowBookmarked] = useState(false);
  
  const bookmarkedTransactions = transactions.filter(t => t.bookmarked);
  const unbookmarkedTransactions = transactions.filter(t => !t.bookmarked);
  const filteredTransactions = showBookmarked 
    ? bookmarkedTransactions 
    : transactions;

  const handleClearHistory = () => {
    onClearHistory();
    // Reset filter to show all items after clearing
    setShowBookmarked(false);
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-background transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 glass-effect">
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">History</h2>
          </div>
          
          <div className="w-10" />
        </div>
        
        {/* Bookmark filter toggle - always show if there are any transactions */}
        {transactions.length > 0 && (
          <div className="px-4 pb-3">
            <Button
              variant={showBookmarked ? "default" : "outline"}
              size="sm"
              onClick={() => setShowBookmarked(!showBookmarked)}
              className="text-xs"
              disabled={bookmarkedTransactions.length === 0}
            >
              <Bookmark className={cn("w-3.5 h-3.5 mr-1", showBookmarked && "fill-current")} />
              Saved ({bookmarkedTransactions.length})
            </Button>
          </div>
        )}
      </header>
      
      {/* Content */}
      <div className="overflow-y-auto h-[calc(100vh-140px)] px-4 py-4">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No transactions yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Complete a purchase to see it here
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No saved receipts</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Tap the bookmark icon to save important receipts
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-md mx-auto">
            {filteredTransactions.map((transaction, index) => (
              <SwipeableItem
                key={transaction.id}
                onDelete={() => onRemoveTransaction(transaction.id)}
                className="animate-fade-in"
              >
                <div 
                  className={cn(
                    "ios-card p-4 relative",
                    transaction.bookmarked && "ring-2 ring-primary/30"
                  )}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {/* Bookmark button */}
                  <button
                    onClick={() => onToggleBookmark(transaction.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-secondary transition-colors"
                  >
                    <Bookmark 
                      className={cn(
                        "w-4 h-4 transition-all",
                        transaction.bookmarked 
                          ? "fill-primary text-primary" 
                          : "text-muted-foreground hover:text-primary"
                      )} 
                    />
                  </button>
                  
                  <div className="flex items-start justify-between mb-3 pr-8">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {format(new Date(transaction.date), 'MMM d, yyyy • h:mm a')}
                      </span>
                    </div>
                    <span className="font-bold text-primary text-lg">
                      ₹{transaction.calculation.total.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5">
                    {transaction.items.slice(0, 3).map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-foreground">
                            {item.quantity}× {item.name}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {transaction.items.length > 3 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        +{transaction.items.length - 3} more items
                      </p>
                    )}
                  </div>
                  
                  {(transaction.calculation.discountPercent > 0 || transaction.calculation.taxAmount > 0) && (
                    <div className="mt-3 pt-2 border-t border-border/50 flex gap-3 text-xs text-muted-foreground">
                      {transaction.calculation.discountPercent > 0 && (
                        <span className="text-primary">
                          -{transaction.calculation.discountPercent}% discount
                        </span>
                      )}
                      <span>Tax: ₹{transaction.calculation.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </SwipeableItem>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer - only show clear button if there are non-bookmarked transactions */}
      {unbookmarkedTransactions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 glass-effect p-4 safe-area-bottom">
          <div className="max-w-md mx-auto">
            <Button
              variant="destructive"
              onClick={handleClearHistory}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History ({unbookmarkedTransactions.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};