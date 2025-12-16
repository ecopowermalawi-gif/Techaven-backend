import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  storage?: string;
  image_url?: string;
  variant_id?: string;
  product_data?: any; // Full product data from API
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  loading: boolean;
  syncing: boolean;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartItemCount: () => number;
  getCartTotal: () => number;
  isInCart: (productId: string, variantId?: string) => boolean;
  syncCartWithServer: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load cart from API on mount
  useEffect(() => {
    loadCartFromAPI();
  }, []);

  // Save cart to AsyncStorage whenever items change
  useEffect(() => {
    saveCartToStorage();
  }, [items]);

  const loadCartFromAPI = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const isAuthenticated = await apiService.isAuthenticated();
      
      if (isAuthenticated) {
        // Load cart from API
        const cartData = await apiService.getCart();
        
        if (cartData && cartData.items) {
          // Transform API cart items to our format
          const apiItems = cartData.items.map((item: any) => ({
            id: item.id || item.item_id || `item-${Date.now()}`,
            product_id: item.product_id,
            name: item.name || item.product_name || 'Product',
            price: item.price || item.unit_price || 0,
            quantity: item.quantity || 1,
            color: item.color,
            storage: item.storage,
            image_url: item.image_url || item.product_image,
            variant_id: item.variant_id,
            product_data: item.product_data,
          }));
          
          setItems(apiItems);
        } else {
          // Load from local storage if API returns empty
          await loadCartFromStorage();
        }
      } else {
        // User not authenticated, load from local storage
        await loadCartFromStorage();
      }
    } catch (error) {
      console.error('Error loading cart from API:', error);
      // Fallback to local storage
      await loadCartFromStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadCartFromStorage = async () => {
    try {
      const cartJson = await AsyncStorage.getItem('shoppingCart');
      if (cartJson) {
        const savedCart = JSON.parse(cartJson);
        setItems(savedCart);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  };

  const saveCartToStorage = async () => {
    try {
      await AsyncStorage.setItem('shoppingCart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  const generateItemId = (productId: string, variantId?: string) => {
    return variantId ? `${productId}_${variantId}` : productId;
  };

  const syncCartWithAPI = async (cartItems: CartItem[]) => {
    try {
      const isAuthenticated = await apiService.isAuthenticated();
      if (!isAuthenticated) return;

      // First, clear the server cart
      await apiService.clearCart();
      
      // Then add all items from local cart
      for (const item of cartItems) {
        await apiService.addToCart({
          product_id: item.product_id,
          quantity: item.quantity,
          variant_id: item.variant_id,
          // Add other fields as needed by your API
        });
      }
    } catch (error) {
      console.error('Error syncing cart with API:', error);
      // Don't throw error - allow user to continue with local cart
    }
  };

  const addToCart = async (itemData: Omit<CartItem, 'id'>) => {
    try {
      setSyncing(true);
      
      const itemId = generateItemId(itemData.product_id, itemData.variant_id);
      
      setItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(item => item.id === itemId);
        
        if (existingItemIndex !== -1) {
          // Update quantity if item already exists
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex].quantity += itemData.quantity;
          return updatedItems;
        } else {
          // Add new item
          const newItem: CartItem = {
            id: itemId,
            ...itemData,
          };
          return [...prevItems, newItem];
        }
      });

      // Sync with API if user is authenticated
      const isAuthenticated = await apiService.isAuthenticated();
      if (isAuthenticated) {
        await apiService.addToCart({
          product_id: itemData.product_id,
          quantity: itemData.quantity,
          variant_id: itemData.variant_id,
        });
      }
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setSyncing(true);
      
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));

      // Sync with API if user is authenticated
      const isAuthenticated = await apiService.isAuthenticated();
      if (isAuthenticated) {
        await apiService.removeCartItem(itemId);
      }
      
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setSyncing(true);
      
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );

      // Sync with API if user is authenticated
      const isAuthenticated = await apiService.isAuthenticated();
      if (isAuthenticated) {
        await apiService.updateCartItem(itemId, quantity);
      }
      
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const clearCart = async () => {
    try {
      setSyncing(true);
      
      setItems([]);

      // Sync with API if user is authenticated
      const isAuthenticated = await apiService.isAuthenticated();
      if (isAuthenticated) {
        await apiService.clearCart();
      }
      
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const getCartItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const isInCart = (productId: string, variantId?: string) => {
    const itemId = generateItemId(productId, variantId);
    return items.some(item => item.id === itemId);
  };

  const syncCartWithServer = async () => {
    try {
      setSyncing(true);
      await syncCartWithAPI(items);
    } catch (error) {
      console.error('Error syncing cart with server:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const refreshCart = async () => {
    await loadCartFromAPI();
  };

  const value: CartContextType = {
    items,
    totalItems: getCartItemCount(),
    subtotal: getCartTotal(),
    loading,
    syncing,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount,
    getCartTotal,
    isInCart,
    syncCartWithServer,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};