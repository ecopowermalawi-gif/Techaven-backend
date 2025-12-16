import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/ThemeContext';
import { useCart, CartItem } from './context/CartContext';
import apiService from './services/api';

export default function CartScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const {
    items,
    subtotal,
    totalItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    loading: cartLoading,
    syncing,
    refreshCart,
  } = useCart();
  
  const [checkingOut, setCheckingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCart();
    setRefreshing(false);
  };

  const handleCheckout = async () => {
    try {
      setCheckingOut(true);
      
      // Check if user is authenticated
      const isAuthenticated = await apiService.isAuthenticated();
      if (!isAuthenticated) {
        Alert.alert(
          'Login Required',
          'Please login to proceed to checkout',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => router.push('/Screen4') }
          ]
        );
        return;
      }
      
      // Check if cart is empty
      if (items.length === 0) {
        Alert.alert('Cart Empty', 'Your cart is empty. Add items to checkout.');
        return;
      }
      
      // Create order with API
      const orderData = {
        items: items.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: subtotal,
        shipping_address: '', // Get from user profile
        payment_method: 'card', // Default
      };
      
      // Create order via API
      const orderResponse = await apiService.createOrder(orderData);
      
      // Clear cart after successful order
      await clearCart();
      
      // Navigate to order confirmation
      router.push({
        pathname: '/OrderConfirmation',
        params: { orderId: orderResponse.id }
      } as any);
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      
      let errorMessage = 'Failed to process checkout. Please try again.';
      if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setCheckingOut(false);
    }
  };

  const handleRemoveItem = async (itemId: string, itemName: string) => {
    Alert.alert(
      'Remove Item',
      `Remove "${itemName}" from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFromCart(itemId)
        }
      ]
    );
  };

  const handleClearCart = () => {
    if (items.length === 0) return;
    
    Alert.alert(
      'Clear Cart',
      'Remove all items from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: clearCart
        }
      ]
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={[styles.cartItem, isDarkMode && styles.darkCartItem]}>
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/100' }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, isDarkMode && styles.darkItemName]}>
          {item.name}
        </Text>
        
        {(item.color || item.storage) && (
          <Text style={[styles.itemVariant, isDarkMode && styles.darkItemVariant]}>
            {[item.color, item.storage].filter(Boolean).join(' • ')}
          </Text>
        )}
        
        <Text style={[styles.itemPrice, isDarkMode && styles.darkItemPrice]}>
          ${item.price.toFixed(2)} each
        </Text>
        
        <View style={styles.itemActions}>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={[styles.quantityButton, isDarkMode && styles.darkQuantityButton]}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={syncing}
            >
              <Text style={[styles.quantityButtonText, isDarkMode && styles.darkQuantityButtonText]}>-</Text>
            </TouchableOpacity>
            
            <Text style={[styles.quantityValue, isDarkMode && styles.darkQuantityValue]}>
              {item.quantity}
            </Text>
            
            <TouchableOpacity
              style={[styles.quantityButton, isDarkMode && styles.darkQuantityButton]}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={syncing}
            >
              <Text style={[styles.quantityButtonText, isDarkMode && styles.darkQuantityButtonText]}>+</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.id, item.name)}
            disabled={syncing}
          >
            <Text style={[styles.removeText, isDarkMode && styles.darkRemoveText]}>
              {syncing ? '...' : 'Remove'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={[styles.itemTotal, isDarkMode && styles.darkItemTotal]}>
        ${(item.price * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  if (cartLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
        <View style={[styles.loadingContainer, isDarkMode && styles.darkLoadingContainer]}>
          <ActivityIndicator size="large" color="#232CAD" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}>
            Loading your cart...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        {/* Header */}
        <View style={[styles.header, isDarkMode && styles.darkHeader]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={isDarkMode ? "#FFFFFF" : "#000000"} 
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>
            Shopping Cart ({totalItems})
          </Text>
          {items.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={handleClearCart}
              disabled={syncing}
            >
              <Text style={[styles.clearText, isDarkMode && styles.darkClearText]}>
                {syncing ? '...' : 'Clear'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyCart}>
            <Text style={[styles.emptyIcon, isDarkMode && styles.darkEmptyIcon]}>🛒</Text>
            <Text style={[styles.emptyTitle, isDarkMode && styles.darkEmptyTitle]}>
              Your cart is empty
            </Text>
            <Text style={[styles.emptyMessage, isDarkMode && styles.darkEmptyMessage]}>
              Add items to get started
            </Text>
            <TouchableOpacity
              style={[styles.shopButton, isDarkMode && styles.darkShopButton]}
              onPress={() => router.push('/Home')}
            >
              <Text style={[styles.shopButtonText, isDarkMode && styles.darkShopButtonText]}>
                Start Shopping
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={items}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.cartList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={isDarkMode ? '#BB86FC' : '#232CAD'}
                />
              }
              ListFooterComponent={
                syncing ? (
                  <View style={styles.syncingContainer}>
                    <ActivityIndicator size="small" color="#232CAD" />
                    <Text style={[styles.syncingText, isDarkMode && styles.darkSyncingText]}>
                      Syncing...
                    </Text>
                  </View>
                ) : null
              }
            />
            
            {/* Order Summary */}
            <View style={[styles.summary, isDarkMode && styles.darkSummary]}>
              <Text style={[styles.summaryTitle, isDarkMode && styles.darkSummaryTitle]}>
                Order Summary
              </Text>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, isDarkMode && styles.darkSummaryLabel]}>
                  Subtotal ({totalItems} items)
                </Text>
                <Text style={[styles.summaryValue, isDarkMode && styles.darkSummaryValue]}>
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, isDarkMode && styles.darkSummaryLabel]}>
                  Shipping
                </Text>
                <Text style={[styles.summaryValue, isDarkMode && styles.darkSummaryValue]}>
                  ${(5.99).toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, isDarkMode && styles.darkSummaryLabel]}>
                  Tax
                </Text>
                <Text style={[styles.summaryValue, isDarkMode && styles.darkSummaryValue]}>
                  ${(subtotal * 0.08).toFixed(2)}
                </Text>
              </View>
              
              <View style={[styles.totalRow, isDarkMode && styles.darkTotalRow]}>
                <Text style={[styles.totalLabel, isDarkMode && styles.darkTotalLabel]}>
                  Total
                </Text>
                <Text style={[styles.totalValue, isDarkMode && styles.darkTotalValue]}>
                  ${(subtotal + 5.99 + (subtotal * 0.08)).toFixed(2)}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.checkoutButton, isDarkMode && styles.darkCheckoutButton]}
                onPress={handleCheckout}
                disabled={checkingOut || syncing || items.length === 0}
              >
                {checkingOut ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.checkoutButtonText}>
                    Proceed to Checkout
                  </Text>
                )}
              </TouchableOpacity>
              
              {!apiService.isAuthenticated() && (
                <Text style={[styles.authNotice, isDarkMode && styles.darkAuthNotice]}>
                  Note: Your cart will be saved locally. Login to sync across devices.
                </Text>
              )}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Layout
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
  },
  clearButton: {
    padding: 8,
  },
  clearText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#EF4444',
  },
  // Cart List
  cartList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  itemVariant: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#232CAD',
    marginBottom: 8,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#000000',
  },
  quantityValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#000000',
    marginHorizontal: 12,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#EF4444',
  },
  itemTotal: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#232CAD',
    marginLeft: 12,
    alignSelf: 'flex-start',
  },
  // Syncing
  syncingContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  syncingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
  },
  // Empty Cart
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#000000',
    marginBottom: 8,
  },
  emptyMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#232CAD',
    borderRadius: 25,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  shopButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  // Order Summary
  summary: {
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  summaryTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000000',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#000000',
  },
  totalValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#232CAD',
  },
  checkoutButton: {
    backgroundColor: '#232CAD',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  authNotice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  // Dark mode styles
  darkSafeArea: {
    backgroundColor: '#121212',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  darkLoadingContainer: {
    backgroundColor: '#121212',
  },
  darkLoadingText: {
    color: '#CCCCCC',
  },
  darkHeader: {
    borderBottomColor: '#333333',
  },
  darkHeaderTitle: {
    color: '#FFFFFF',
  },
  darkClearText: {
    color: '#F87171',
  },
  darkCartItem: {
    backgroundColor: '#2D2D2D',
    borderColor: '#444444',
  },
  darkItemName: {
    color: '#FFFFFF',
  },
  darkItemVariant: {
    color: '#AAAAAA',
  },
  darkItemPrice: {
    color: '#BB86FC',
  },
  darkQuantityButton: {
    backgroundColor: '#3D3D3D',
    borderColor: '#444444',
  },
  darkQuantityButtonText: {
    color: '#FFFFFF',
  },
  darkQuantityValue: {
    color: '#FFFFFF',
  },
  darkRemoveText: {
    color: '#F87171',
  },
  darkItemTotal: {
    color: '#BB86FC',
  },
  darkSyncingText: {
    color: '#AAAAAA',
  },
  darkEmptyIcon: {
    color: '#AAAAAA',
  },
  darkEmptyTitle: {
    color: '#FFFFFF',
  },
  darkEmptyMessage: {
    color: '#AAAAAA',
  },
  darkShopButton: {
    backgroundColor: '#BB86FC',
  },
  darkShopButtonText: {
    color: '#000000',
  },
  darkSummary: {
    backgroundColor: '#1E1E1E',
    borderTopColor: '#333333',
  },
  darkSummaryTitle: {
    color: '#FFFFFF',
  },
  darkSummaryLabel: {
    color: '#AAAAAA',
  },
  darkSummaryValue: {
    color: '#CCCCCC',
  },
  darkTotalRow: {
    borderTopColor: '#444444',
  },
  darkTotalLabel: {
    color: '#FFFFFF',
  },
  darkTotalValue: {
    color: '#BB86FC',
  },
  darkCheckoutButton: {
    backgroundColor: '#BB86FC',
  },
  darkCheckoutButtonText: {
    color: '#000000',
  },
  darkAuthNotice: {
    color: '#AAAAAA',
  },
});