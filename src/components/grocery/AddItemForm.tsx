import { useState } from "react";
import { Plus, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CameraScanner } from "./CameraScanner";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface AddItemFormProps {
  onAdd: (
    name: string,
    quantity: number,
    price: number,
    category?: string
  ) => void;
}

export const AddItemForm = ({ onAdd }: AddItemFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const { click, success, typing } = useSoundEffects();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !price) {
      click();
      toast.error("Please fill in item name and price");
      return;
    }

    success();
    onAdd(
      name.trim(),
      parseInt(quantity) || 1,
      parseFloat(price) || 0,
      category.trim() || undefined
    );

    setName("");
    setQuantity("1");
    setPrice("");
    setCategory("");
    setIsOpen(false);

    toast.success("Item added");
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const lastChar = newValue.slice(-1);

    // Play typing sound only for actual character input (not backspace/delete)
    if (newValue.length > price.length && /[0-9.]/.test(lastChar)) {
      typing();
    }

    setPrice(newValue);
  };
  const handleOpenForm = () => {
    click();
    setIsOpen(true);
  };
  const handleCloseForm = () => {
    click();
    setIsOpen(false);
  };

  const handleScan = () => {
    click();
    setIsScannerOpen(true);
  };

  const handleItemScanned = (item: {
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }) => {
    success();
    onAdd(item.name, item.quantity, item.price, item.category);
    toast.success(`Scanned: ${item.name}`);
  };

  if (!isOpen) {
    return (
      <>
        <div className="flex gap-3">
          <button
            onClick={handleOpenForm}
            className="flex-1 h-14 bg-foreground text-background rounded-full flex items-center gap-3 px-2 pr-6 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] glow-green"
          >
            <div className="w-10 h-10 rounded-full premium-gradient flex items-center justify-center shadow-md">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold">Add Item</span>
          </button>
          <Button
            variant="ios-gray"
            size="lg"
            onClick={handleScan}
            className="px-4 h-14 shadow-md hover:shadow-lg transition-all"
          >
            <Camera className="w-5 h-5" />
          </Button>
        </div>
        <CameraScanner
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onItemScanned={handleItemScanned}
        />
      </>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="ios-card-elevated p-4 space-y-4 animate-scale-in"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-lg">New Item</h3>
        <button
          type="button"
          onClick={handleCloseForm}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <Input
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-12 rounded-xl bg-secondary border-0 text-base"
        autoFocus
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          className="h-12 rounded-xl bg-secondary border-0 text-base"
        />
        <Input
          type="number"
          placeholder="Price"
          value={price}
          onChange={handlePriceChange}
          step="0.01"
          min="0"
          className="h-12 rounded-xl bg-secondary border-0 text-base"
        />
      </div>

      <Input
        placeholder="Category (optional)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="h-12 rounded-xl bg-secondary border-0 text-base"
      />

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="ios-gray"
          onClick={handleCloseForm}
          className="flex-1"
          size="lg"
        >
          Cancel
        </Button>
        <Button type="submit" variant="ios" className="flex-1" size="lg">
          Add
        </Button>
      </div>
    </form>
  );
};
