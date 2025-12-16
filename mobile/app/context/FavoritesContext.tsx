import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compare_at_price?: number;
  images?: string[];
  primary_image?: string;
  category_id?: string;
  average_rating?: number;
  rating_count?: number;
  // Add other product fields as needed
}

interface FavoritesContextType {
  favorites: Product[];
  loading: boolean;
  syncing: boolean;
  favoritesCount: number;
  isFavorite: (productId: string) => boolean;
  addToFavorites: (product: Product) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  toggleFavorite: (product: Product) => Promise<void>;
  refreshFavorites: () => Promise<void>;
  clearFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load favorites from API on mount
  useEffect(() => {
    loadFavoritesFromAPI();
  }, []);

  // Save favorites to AsyncStorage whenever they change
  useEffect(() => {
    saveFavoritesToStorage();
  }, [favorites]);

  const loadFavoritesFromAPI = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const isAuthenticated = await apiService.isAuthenticated();
      
      if (isAuthenticated) {
        // Load favorites from API
        const favoritesData = await apiService.getFavorites();
        
        if (Array.isArray(favoritesData)) {
          setFavorites(favoritesData);
        } else if (favoritesData && favoritesData.items) {
          setFavorites(favoritesData.items);
        } else if (favoritesData && Array.isArray(favoritesData.products)) {
          // Handle different API response format
          setFavorites(favoritesData.products);
        } else {
          // Load from local storage if API returns empty
          await loadFavoritesFromStorage();
        }
      } else {
        // User not authenticated, load from local storage
        await loadFavoritesFromStorage();
      }
    } catch (error) {
      console.error('Error loading favorites from API:', error);
      // Fallback to local storage
      await loadFavoritesFromStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFavoritesFromStorage = async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem('userFavorites');
      if (favoritesJson) {
        const savedFavorites = JSON.parse(favoritesJson);
        setFavorites(savedFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
    }
  };

  const saveFavoritesToStorage = async () => {
    try {
      await AsyncStorage.setItem('userFavorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
    }
  };

  const syncFavoritesWithAPI = async (favoritesList: Product[]) => {
    try {
      const isAuthenticated = await apiService.isAuthenticated();
      if (!isAuthenticated) return;

      // Get current favorites from API
      const apiFavorites = await apiService.getFavorites();
      
      // Handle different API response formats
      let apiProductIds: string[];
      if (Array.isArray(apiFavorites)) {
        apiProductIds = apiFavorites.map((p: Product) => p.id);
      } else if (apiFavorites?.items) {
        apiProductIds = (apiFavorites.items as Product[]).map((p: Product) => p.id);
      } else if (apiFavorites?.products) {
        apiProductIds = (apiFavorites.products as Product[]).map((p: Product) => p.id);
      } else {
        apiProductIds = [];
      }

      // Add favorites that aren't in API
      for (const product of favoritesList) {
        if (!apiProductIds.includes(product.id)) {
          await apiService.addToFavorites(product.id);
        }
      }

      // Remove from API favorites that aren't in local
      const localProductIds = favoritesList.map((p: Product) => p.id);
      for (const productId of apiProductIds) {
        if (!localProductIds.includes(productId)) {
          await apiService.removeFromFavorites(productId);
        }
      }
    } catch (error) {
      console.error('Error syncing favorites with API:', error);
      // Don't throw error - allow user to continue with local favorites
    }
  };

  const addToFavorites = async (product: Product) => {
    try {
      setSyncing(true);
      
      // Check if already in favorites
      if (favorites.some(fav => fav.id === product.id)) {
        return;
      }

      setFavorites(prev => [...prev, product]);

      // Sync with API if user is authenticated
      const isAuthenticated = await apiService.isAuthenticated();
      if (isAuthenticated) {
        await apiService.addToFavorites(product.id);
      }
      
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const removeFromFavorites = async (productId: string) => {
    try {
      setSyncing(true);
      
      setFavorites(prev => prev.filter(fav => fav.id !== productId));

      // Sync with API if user is authenticated
      const isAuthenticated = await apiService.isAuthenticated();
      if (isAuthenticated) {
        await apiService.removeFromFavorites(productId);
      }
      
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const toggleFavorite = async (product: Product) => {
    try {
      setSyncing(true);
      
      if (isFavorite(product.id)) {
        await removeFromFavorites(product.id);
      } else {
        await addToFavorites(product);
      }
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const isFavorite = (productId: string): boolean => {
    return favorites.some(fav => fav.id === productId);
  };

  const refreshFavorites = async () => {
    await loadFavoritesFromAPI();
  };

  const clearFavorites = async () => {
    try {
      setSyncing(true);
      
      setFavorites([]);

      // Sync with API if user is authenticated
      const isAuthenticated = await apiService.isAuthenticated();
      if (isAuthenticated) {
        // Remove all favorites from API
        const currentFavorites = await apiService.getFavorites();
        let favoritesToRemove: Product[] = [];
        
        if (Array.isArray(currentFavorites)) {
          favoritesToRemove = currentFavorites;
        } else if (currentFavorites?.items) {
          favoritesToRemove = currentFavorites.items as Product[];
        } else if (currentFavorites?.products) {
          favoritesToRemove = currentFavorites.products as Product[];
        }
        
        for (const product of favoritesToRemove) {
          await apiService.removeFromFavorites(product.id);
        }
      }
      
    } catch (error) {
      console.error('Error clearing favorites:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const value: FavoritesContextType = {
    favorites,
    loading,
    syncing,
    favoritesCount: favorites.length,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    refreshFavorites,
    clearFavorites,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};