import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const LOCAL_FAVORITES_KEY = 'toolnest-favorites';

function getStoredFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const item = localStorage.getItem(LOCAL_FAVORITES_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

function saveStoredFavorites(favs: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(favs));
  } catch {
    // ignore
  }
}

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(getStoredFavorites);

  // Sync state with storage events across multiple tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_FAVORITES_KEY) {
        setFavorites(getStoredFavorites());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites(prev => {
      const exists = prev.includes(slug);
      const updated = exists ? prev.filter(s => s !== slug) : [...prev, slug];
      saveStoredFavorites(updated);
      return updated;
    });

    // Notify user safely outside state setter cycle
    setTimeout(() => {
      const current = getStoredFavorites();
      if (current.includes(slug)) {
        toast.success('Saved to bookmarked tools');
      } else {
        toast.info('Removed from bookmarked tools');
      }
    }, 0);
  }, []);

  const isFavorite = useCallback((slug: string) => {
    return favorites.includes(slug);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    saveStoredFavorites([]);
    setFavorites([]);
    setTimeout(() => {
      toast.success('All bookmarks cleared');
    }, 0);
  }, []);

  const contextValue = useMemo(() => ({
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites
  }), [favorites, toggleFavorite, isFavorite, clearFavorites]);

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

// Backwards compatibility hook
export const useAuth = useFavorites;
