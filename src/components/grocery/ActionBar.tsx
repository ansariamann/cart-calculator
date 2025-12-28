import { Trash2, Printer, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateReceiptPDF } from "@/utils/receiptGenerator";
import { GroceryItem, BillCalculation } from "@/types/grocery";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { FavoritesPopover } from "./FavoritesPopover";
import { FavoriteItem } from "@/hooks/useFavorites";

interface ActionBarProps {
  onClearChecked: () => void;
  checkedCount: number;
  total: number;
  items: GroceryItem[];
  calculation: BillCalculation;
  onSaveTransaction: () => void;
  onNewTransaction: () => void;
  favorites: FavoriteItem[];
  onAddFavoriteToList: (item: FavoriteItem) => void;
  onRemoveFavorite: (id: string) => void;
}

export const ActionBar = ({
  onClearChecked,
  checkedCount,
  total,
  items,
  calculation,
  onSaveTransaction,
  onNewTransaction,

  favorites,
  onAddFavoriteToList,
  onRemoveFavorite,
}: ActionBarProps) => {
  const { click, success, remove } = useSoundEffects();

  const handlePrintReceipt = () => {
    if (items.length === 0) {
      click();
      toast.error("Add items to print receipt");
      return;
    }
    success();
    generateReceiptPDF(items, calculation);
    onSaveTransaction();
    toast.success("Receipt downloaded & saved to history");
  };

  const handleClearChecked = () => {
    remove();
    onClearChecked();
    toast.success(`Removed ${checkedCount} items`);
  };

  const handleNewTransaction = () => {
    success();
    onNewTransaction();
    toast.success("Started new list");
  };

  return (
    <div className="glass-effect border-t border-border/30 p-4 mt-6">
      <div className="max-w-md mx-auto flex items-center gap-2">
        {checkedCount > 0 && (
          <Button
            variant="ios-gray"
            size="icon"
            onClick={handleClearChecked}
            className="shrink-0 shadow-md hover:shadow-lg transition-all"
          >
            <Trash2 className="w-5 h-5 text-destructive" />
          </Button>
        )}

        <Button
          variant="ios-gray"
          size="icon"
          onClick={handleNewTransaction}
          className="shrink-0 shadow-md hover:shadow-lg transition-all relative group"
          title="New Transaction"
        >
          <Plus className="w-5 h-5 text-primary group-hover:rotate-90 transition-transform duration-300" />
          <span className="absolute inset-0 rounded-full bg-primary/20 group-hover:animate-pulse" />
        </Button>

        <FavoritesPopover
          favorites={favorites}
          onAddToList={onAddFavoriteToList}
          onRemoveFavorite={onRemoveFavorite}
        />

        <Button
          onClick={handlePrintReceipt}
          className="flex-1 premium-gradient text-white font-bold shadow-lg hover:shadow-xl glow-green transition-all"
          size="lg"
        >
          <Printer className="w-5 h-5" />
          Print Receipt
        </Button>
      </div>
    </div>
  );
};
