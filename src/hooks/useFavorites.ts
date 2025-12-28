import { useState, useEffect, useCallback } from 'react';

export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  category?: string;
}

const FAVORITES_KEY = 'grocery-favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse favorites:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  const addFavorite = useCallback((item: Omit<FavoriteItem, 'id'>) => {
    const newFavorite: FavoriteItem = {
      ...item,
      id: crypto.randomUUID(),
    };
    setFavorites(prev => [...prev, newFavorite]);
    return newFavorite;
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  }, []);

  const isFavorite = useCallback((name: string) => {
    return favorites.some(f => f.name.toLowerCase() === name.toLowerCase());
  }, [favorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
};
