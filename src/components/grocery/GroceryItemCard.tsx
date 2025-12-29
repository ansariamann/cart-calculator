import { useState, useRef } from "react";
import { Check, Trash2, Minus, Plus, Star } from "lucide-react";
import { GroceryItem } from "@/types/grocery";
import { cn } from "@/lib/utils";
import { SwipeableItem } from "./SwipeableItem";
import { Input } from "@/components/ui/input";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { toast } from "sonner";

interface GroceryItemCardProps {
  item: GroceryItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onUpdateName: (id: string, name: string) => void;
  onAddToFavorites?: (item: {
    name: string;
    price: number;
    category?: string;
  }) => void;
  isFavorite?: boolean;
  index: number;
  isLast?: boolean;
}

export const GroceryItemCard = ({
  item,
  onToggle,
  onRemove,
  onUpdateQuantity,
  onUpdatePrice,
  onUpdateName,
  onAddToFavorites,
  isFavorite,
  index,
  isLast,
}: GroceryItemCardProps) => {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [priceInput, setPriceInput] = useState(item.price.toString());
  const [nameInput, setNameInput] = useState(item.name);
  const totalPrice = item.quantity * item.price;
  const { click, remove, success, typing } = useSoundEffects();
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [showFavIndicator, setShowFavIndicator] = useState(false);

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      if (onAddToFavorites && !isFavorite) {
        success();
        onAddToFavorites({
          name: item.name,
          price: item.price,
          category: item.category,
        });
        setShowFavIndicator(true);
        toast.success(`${item.name} added to favorites!`);
        setTimeout(() => setShowFavIndicator(false), 1500);
      } else if (isFavorite) {
        toast.info("Already in favorites");
      }
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleDecrement = () => {
    if (item.quantity <= 1) {
      remove();
      onRemove(item.id);
    } else {
      click();
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    click();
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleToggle = () => {
    click();
    onToggle(item.id);
  };

  const handlePriceClick = () => {
    setPriceInput(item.price.toString());
    setIsEditingPrice(true);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const lastChar = newValue.slice(-1);

    // Play typing sound only for actual character input (not backspace/delete)
    if (newValue.length > priceInput.length && /[0-9.]/.test(lastChar)) {
      typing();
    }

    setPriceInput(newValue);
  };

  const handlePriceSubmit = () => {
    const newPrice = parseFloat(priceInput);
    if (!isNaN(newPrice) && newPrice >= 0) {
      onUpdatePrice(item.id, newPrice);
    }
    setIsEditingPrice(false);
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePriceSubmit();
    } else if (e.key === "Escape") {
      setIsEditingPrice(false);
    }
  };

  const handleNameClick = () => {
    setNameInput(item.name);
    setIsEditingName(true);
  };

  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      onUpdateName(item.id, nameInput.trim());
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      setIsEditingName(false);
    }
  };

  return (
    <SwipeableItem
      onDelete={() => onRemove(item.id)}
      className="animate-fade-in"
    >
      <div
        className={cn(
          "p-4 transition-all duration-200 relative bg-card",
          {
            "opacity-50": item.checked,
            "border-b": !isLast,
          }
        )}
        style={{ animationDelay: `${index * 40}ms` }}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
      >
        {/* Favorite indicator */}
        {(isFavorite || showFavIndicator) && (
          <div
            className={cn(
              "absolute top-2 right-2 transition-all",
              showFavIndicator && "animate-scale-in"
            )}
          >
            <Star className="w-4 h-4 text-warning fill-warning" />
          </div>
        )}
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <button
            onClick={handleToggle}
            className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
              item.checked
                ? "bg-primary border-primary"
                : "border-muted-foreground/30 hover:border-primary"
            )}
          >
            {item.checked && (
              <Check
                className="w-3.5 h-3.5 text-primary-foreground"
                strokeWidth={3}
              />
            )}
          </button>

          {/* Item Info */}
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <Input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={handleNameKeyDown}
                className="h-8 text-sm px-2"
                autoFocus
              />
            ) : (
              <button
                onClick={handleNameClick}
                className={cn(
                  "font-medium text-left hover:text-primary transition-colors",
                  item.checked
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                )}
              >
                {item.name}
              </button>
            )}
            {item.category && !isEditingName && (
              <span className="text-xs text-muted-foreground block">
                {item.category}
              </span>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrement}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95",
                item.quantity <= 1
                  ? "bg-destructive/10 text-destructive"
                  : "bg-secondary text-foreground"
              )}
            >
              {item.quantity <= 1 ? (
                <Trash2 className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
            </button>

            <span className="font-semibold text-foreground w-6 text-center">
              {item.quantity}
            </span>

            <button
              onClick={handleIncrement}
              className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Price */}
          <div className="text-right min-w-[70px]">
            {isEditingPrice ? (
              <Input
                type="number"
                value={priceInput}
                onChange={handlePriceChange}
                onBlur={handlePriceSubmit}
                onKeyDown={handlePriceKeyDown}
                className="w-20 h-8 text-right text-sm px-2"
                step="0.01"
                min="0"
                autoFocus
              />
            ) : (
              <button
                onClick={handlePriceClick}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                ₹{totalPrice.toFixed(2)}
              </button>
            )}
            {item.quantity > 1 && !isEditingPrice && (
              <p className="text-xs text-muted-foreground">
                ₹{item.price.toFixed(2)} ea
              </p>
            )}
          </div>
        </div>
      </div>
    </SwipeableItem>
  );
};
