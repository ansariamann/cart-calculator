import { useState, useEffect, useCallback } from 'react';
import { Transaction, GroceryItem, BillCalculation } from '@/types/grocery';

const STORAGE_KEY = 'quickmart_transaction_history';

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useTransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTransactions(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse transaction history');
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

  const addTransaction = useCallback((items: GroceryItem[], calculation: BillCalculation) => {
    const newTransaction: Transaction = {
      id: generateId(),
      date: new Date().toISOString(),
      items: [...items],
      calculation: { ...calculation },
    };
    setTransactions(prev => [newTransaction, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, bookmarked: !t.bookmarked } : t
    ));
  }, []);

  const clearHistory = useCallback(() => {
    // Keep bookmarked transactions, only clear non-bookmarked ones
    setTransactions(prev => prev.filter(t => t.bookmarked));
  }, []);

  return {
    transactions,
    addTransaction,
    removeTransaction,
    toggleBookmark,
    clearHistory,
  };
};
