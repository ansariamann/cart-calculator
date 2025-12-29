import { useEffect, useState } from "react";
import { Header } from "../src/components/grocery/Header";
import { BudgetTracker } from "../src/components/grocery/BudgetTracker";
import { GroceryItemCard } from "../src/components/grocery/GroceryItemCard";
import { AddItemForm } from "../src/components/grocery/AddItemForm";
import { BillSummary } from "../src/components/grocery/BillSummary";
import { ActionBar } from "../src/components/grocery/ActionBar";
import { HistoryModal } from "../src/components/grocery/HistoryModal";
import { useGroceryList } from "../src/hooks/useGroceryList";
import { useTransactionHistory } from "../src/hooks/useTransactionHistory";
import { useFavorites, FavoriteItem } from "../src/hooks/useFavorites";
import { ShoppingBag, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../src/components/ui/button";

const Index = () => {
  const {
    items,
    addItem,
    removeItem,
    toggleItem,
    updateItem,
    clearChecked,
    clearAll,
    taxRate,
    setTaxRate,
    discountPercent,
    setDiscountPercent,
    billCalculation,
    budget,
    setBudget,
  } = useGroceryList();

  const {
    transactions,
    addTransaction,
    removeTransaction,
    toggleBookmark,
    clearHistory,
  } = useTransactionHistory();

  const { favorites, addFavorite, removeFavorite } = useFavorites();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show scroll-to-top button only when scrolled down AND list is long
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 300;
      const hasLongList = items.length >= 5;
      setShowScrollTop(scrolled && hasLongList);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items.length]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddFavoriteToList = (item: FavoriteItem) => {
    addItem(item.name, 1, item.price, item.category);
    toast.success(`Added ${item.name} to list`);
  };

  const checkedCount = items.filter((item) => item.checked).length;

  // Update spent = accumulated past transactions + current items total
  useEffect(() => {
    setBudget((prev) => ({
      ...prev,
      spent: prev.accumulated + billCalculation.total,
    }));
  }, [billCalculation.total, setBudget]);

  const handleSaveTransaction = () => {
    if (items.length > 0) {
      addTransaction(items, billCalculation);
    }
  };

  // Auto-save receipt when items change and there are items
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (items.length > 0 && billCalculation.total > 0) {
        // Check if this transaction is different from the last one
        const lastTransaction = transactions[0];
        const currentItemIds = items
          .map((i) => i.id)
          .sort()
          .join(",");
        const lastItemIds =
          lastTransaction?.items
            .map((i) => i.id)
            .sort()
            .join(",") || "";

        if (currentItemIds !== lastItemIds) {
          addTransaction(items, billCalculation);
        }
      }
    }, 2000); // Debounce for 2 seconds

    return () => clearTimeout(saveTimeout);
  }, [items, billCalculation, transactions, addTransaction]);

  const handleNewTransaction = () => {
    if (items.length > 0) {
      handleSaveTransaction();
    }
    clearAll();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onOpenHistory={() => setIsHistoryOpen(true)} />

      <main className="max-w-md mx-auto px-4 py-4 space-y-4 flex-grow w-full">
        {/* Budget Tracker */}
        <BudgetTracker
          budget={budget}
          onBudgetChange={(limit) => setBudget((prev) => ({ ...prev, limit }))}
          onBudgetReset={() =>
            setBudget({
              limit: 1000,
              spent: billCalculation.total,
              accumulated: 0,
            })
          }
        />

        {/* Add Item Section */}
        <section
          className="animate-slide-up"
          style={{ animationDelay: "50ms" }}
        >
          <AddItemForm onAdd={addItem} />
        </section>

        {/* Grocery List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-semibold text-foreground">Shopping List</h2>
            <span className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="ios-card p-8 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium">No items yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tap &quot;Add Item&quot; to get started
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-[1.25rem] border overflow-hidden shadow-ios">
              {items.map((item, index) => (
                <GroceryItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  onToggle={toggleItem}
                  onRemove={removeItem}
                  onUpdateQuantity={(id, quantity) =>
                    updateItem(id, { quantity })
                  }
                  onUpdatePrice={(id, price) => updateItem(id, { price })}
                  onUpdateName={(id, name) => updateItem(id, { name })}
                  onAddToFavorites={addFavorite}
                  isFavorite={favorites.some(
                    (f) => f.name.toLowerCase() === item.name.toLowerCase()
                  )}
                  isLast={index === items.length - 1}
                />
              ))}
            </div>
          )}
        </section>

        {/* Bill Summary */}
        {items.length > 0 && (
          <BillSummary
            calculation={billCalculation}
            taxRate={taxRate}
            discountPercent={discountPercent}
            onTaxChange={setTaxRate}
            onDiscountChange={setDiscountPercent}
            itemCount={items.length}
          />
        )}
      </main>

      {/* Bottom Action Bar */}
      <ActionBar
        onClearChecked={clearChecked}
        checkedCount={checkedCount}
        total={billCalculation.total}
        items={items}
        calculation={billCalculation}
        onSaveTransaction={handleSaveTransaction}
        onNewTransaction={handleNewTransaction}
        favorites={favorites}
        onAddFavoriteToList={handleAddFavoriteToList}
        onRemoveFavorite={removeFavorite}
      />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          variant="ios"
          size="icon"
          className="fixed bottom-6 right-6 z-50 shadow-lg animate-fade-in h-12 w-12"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        transactions={transactions}
        onRemoveTransaction={removeTransaction}
        onToggleBookmark={toggleBookmark}
        onClearHistory={clearHistory}
      />
    </div>
  );
};

export default Index;
