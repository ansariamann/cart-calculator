import { useState, useCallback, useMemo, useEffect } from "react";
import { GroceryItem, BillCalculation, Budget } from "../types/grocery";

const generateId = () => Math.random().toString(36).substring(2, 9);

const STORAGE_KEYS = {
  items: "grocery-items",
  budget: "grocery-budget",
  taxRate: "grocery-tax-rate",
  discountPercent: "grocery-discount",
};

export const useGroceryList = () => {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [taxRate, setTaxRate] = useState(8.5);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [budget, setBudget] = useState<Budget>({
    limit: 1000,
    spent: 0,
    accumulated: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(STORAGE_KEYS.items);
      const storedBudget = localStorage.getItem(STORAGE_KEYS.budget);
      const storedTaxRate = localStorage.getItem(STORAGE_KEYS.taxRate);
      const storedDiscount = localStorage.getItem(
        STORAGE_KEYS.discountPercent
      );

      if (storedItems) setItems(JSON.parse(storedItems));
      if (storedBudget) setBudget(JSON.parse(storedBudget));
      if (storedTaxRate) setTaxRate(JSON.parse(storedTaxRate));
      if (storedDiscount) setDiscountPercent(JSON.parse(storedDiscount));
    } catch (e) {
      console.error("Failed to load data from localStorage:", e);
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.items, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.budget, JSON.stringify(budget));
    }
  }, [budget, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.taxRate, JSON.stringify(taxRate));
    }
  }, [taxRate, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        STORAGE_KEYS.discountPercent,
        JSON.stringify(discountPercent)
      );
    }
  }, [discountPercent, isLoaded]);

  const addItem = useCallback(
    (name: string, quantity: number, price: number, category?: string) => {
      const newItem: GroceryItem = {
        id: generateId(),
        name,
        quantity,
        price,
        checked: false,
        category,
      };
      setItems((prev) => [...prev, newItem]);
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }, []);

  const updateItem = useCallback(
    (id: string, updates: Partial<GroceryItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const clearChecked = useCallback(() => {
    setItems((prev) => prev.filter((item) => !item.checked));
  }, []);

  const clearAll = useCallback(() => {
    // Calculate current total and add to accumulated before clearing
    setItems((currentItems) => {
      const subtotal = currentItems.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );
      const discountAmt = subtotal * (discountPercent / 100);
      const subtotalAfterDiscount = subtotal - discountAmt;
      const taxAmt = subtotalAfterDiscount * (taxRate / 100);
      const currentTotal = subtotalAfterDiscount + taxAmt;

      setBudget((prev) => ({
        ...prev,
        accumulated: prev.accumulated + currentTotal,
        spent: prev.accumulated + currentTotal,
      }));
      return [];
    });
    setDiscountPercent(0);
  }, [discountPercent, taxRate]);

  const billCalculation = useMemo((): BillCalculation => {
    // Calculate subtotal: sum of (quantity * price) for all items
    const subtotal = items.reduce((sum, item) => {
      return sum + item.quantity * item.price;
    }, 0);

    // Calculate discount amount
    const discountAmount = subtotal * (discountPercent / 100);

    // Subtotal after discount
    const subtotalAfterDiscount = subtotal - discountAmount;

    // Calculate tax on discounted subtotal
    const taxAmount = subtotalAfterDiscount * (taxRate / 100);

    // Calculate final total
    const total = subtotalAfterDiscount + taxAmount;

    return {
      subtotal,
      taxRate,
      taxAmount,
      discountPercent,
      discountAmount,
      total,
    };
  }, [items, taxRate, discountPercent]);

  // Update budget spent based on total
  const updateBudget = useCallback(() => {
    setBudget((prev) => ({ ...prev, spent: billCalculation.total }));
  }, [billCalculation.total]);

  return {
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
    updateBudget,
  };
};
