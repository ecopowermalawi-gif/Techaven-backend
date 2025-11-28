import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Cart() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });

  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      name: 'Wireless Earbuds',
      price: 99.99,
      quantity: 1,
      icon: '🎧',
    },
    {
      id: '2',
      name: 'Smart Watch',
      price: 199.99,
      quantity: 1,
      icon: '⌚',
    },
    {
      id: '3',
      name: 'Bluetooth Speaker',
      price: 149.99,
      quantity: 1,
      icon: '🔊',
    },
  ]);

  const [promoCode, setPromoCode] = useState('');
  const router = useRouter();

  const updateQuantity = (id: string, change: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return newQuantity >= 1 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setCartItems(prevItems => prevItems.filter(item => item.id !== id));
          }
        },
      ]
    );
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to your cart before checkout.');
      return;
    }
    router.push('/Checkout');
  };

  const handleContinueShopping = () => {
    router.back();
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const CartItem = ({ item }: { item: typeof cartItems[0] }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemLeft}>
        <View style={styles.itemIconContainer}>
          <Text style={styles.itemIcon}>{item.icon}</Text>
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.itemRight}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, -1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeItem(item.id)}
        >
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Shopping Cart</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Cart Items */}
          <View style={styles.cartSection}>
            <Text style={styles.sectionTitle}>
              My Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </Text>
            
            {cartItems.length === 0 ? (
              <View style={styles.emptyCart}>
                <Text style={styles.emptyCartIcon}>🛒</Text>
                <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
                <Text style={styles.emptyCartText}>
                  Browse our products and add items to your cart
                </Text>
                <TouchableOpacity 
                  style={styles.continueShoppingButton}
                  onPress={handleContinueShopping}
                >
                  <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cartItemsContainer}>
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </View>
            )}
          </View>

          {/* Promo Code */}
          {cartItems.length > 0 && (
            <View style={styles.promoSection}>
              <Text style={styles.sectionTitle}>Promo Code</Text>
              <View style={styles.promoContainer}>
                <TextInput
                  style={styles.promoInput}
                  placeholder="Enter promo code"
                  placeholderTextColor="#999"
                  value={promoCode}
                  onChangeText={setPromoCode}
                />
                <TouchableOpacity style={styles.applyButton}>
                  <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Order Summary */}
          {cartItems.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>${calculateSubtotal().toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax</Text>
                  <Text style={styles.summaryValue}>${calculateTax().toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shipping</Text>
                  <Text style={styles.summaryValue}>Free</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Checkout Button */}
        {cartItems.length > 0 && (
          <View style={styles.checkoutContainer}>
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutText}>
                Proceed to Checkout - ${calculateTotal().toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#232CAD',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  // Section Styles
  cartSection: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  promoSection: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  summarySection: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 100,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
    marginBottom: 16,
  },
  // Empty Cart Styles
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  emptyCartIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyCartTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyCartText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  continueShoppingButton: {
    backgroundColor: '#232CAD',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  continueShoppingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  // Cart Items Styles
  cartItemsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#F2F2FF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemIcon: {
    fontSize: 20,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#232CAD',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    padding: 4,
    marginBottom: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#232CAD',
  },
  quantityText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#000000',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#FF3B30',
  },
  // Promo Code Styles
  promoContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  promoInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  applyButton: {
    backgroundColor: '#232CAD',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  // Order Summary Styles
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#000000',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
  },
  totalValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#232CAD',
  },
  // Checkout Button Styles
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutButton: {
    backgroundColor: '#232CAD',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#232CAD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});