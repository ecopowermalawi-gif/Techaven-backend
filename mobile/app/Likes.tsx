import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './context/ThemeContext';
import { useFavorites } from './context/FavoritesContext';
import { useCart } from './context/CartContext';
import apiService from './services/api';

const { width } = Dimensions.get('window');

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compare_at_price?: number;
  images?: string[];
  primary_image?: string;
  average_rating?: number;
  rating_count?: number;
  category_id?: string;
  in_stock?: boolean;
}

export default function FavoritesScreen() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });
  
  const [refreshing, setRefreshing] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { favorites, loading, refreshFavorites, removeFromFavorites, clearFavorites } = useFavorites();
  const { addToCart } = useCart();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFavorites();
    setRefreshing(false);
  };

  const handleProductPress = (productId: string) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: productId }
    } as any);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      setAddingToCart(product.id);
      
      // Check authentication
      const isAuthenticated = await apiService.isAuthenticated();
      if (!isAuthenticated) {
        Alert.alert(
          'Login Required',
          'Please login to add items to your cart',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => router.push('/Screen4') }
          ]
        );
        return;
      }
      
      // Add to cart - use correct parameter name
      await addToCart({
        product_id: product.id,
        name: product.title,
        price: product.price,
        quantity: 1,
        image_url: product.primary_image || product.images?.[0],
      });
      
      Alert.alert(
        'Success',
        `${product.title} added to cart!`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => router.push('/Cart') }
        ]
      );
      
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleRemoveFavorite = (productId: string, productTitle: string) => {
    Alert.alert(
      'Remove Favorite',
      `Remove "${productTitle}" from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFromFavorites(productId)
        }
      ]
    );
  };

  const handleClearAllFavorites = () => {
    if (favorites.length === 0) return;
    
    Alert.alert(
      'Clear All Favorites',
      'Remove all items from favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: clearFavorites
        }
      ]
    );
  };

  const renderProductItem = ({ item, index }: { item: Product; index: number }) => (
    <View style={[styles.productCard, isDarkMode && styles.darkProductCard]}>
      <TouchableOpacity 
        style={styles.productImageContainer}
        onPress={() => handleProductPress(item.id)}
      >
        {item.primary_image || item.images?.[0] ? (
          <Image
            source={{ uri: item.primary_image || item.images?.[0] }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.productImagePlaceholder, isDarkMode && styles.darkProductImagePlaceholder]}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <View style={styles.productInfo}>
        <TouchableOpacity onPress={() => handleProductPress(item.id)}>
          <Text style={[styles.productTitle, isDarkMode && styles.darkProductTitle]} numberOfLines={2}>
            {item.title}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.priceContainer}>
          <Text style={[styles.productPrice, isDarkMode && styles.darkProductPrice]}>
            ${item.price.toFixed(2)}
          </Text>
          {item.compare_at_price && item.compare_at_price > item.price && (
            <Text style={[styles.comparePrice, isDarkMode && styles.darkComparePrice]}>
              ${item.compare_at_price.toFixed(2)}
            </Text>
          )}
        </View>
        
        {item.average_rating && (
          <View style={styles.ratingContainer}>
            <Text style={[styles.ratingText, isDarkMode && styles.darkRatingText]}>
              ⭐ {item.average_rating.toFixed(1)}
            </Text>
            {item.rating_count && (
              <Text style={[styles.ratingCount, isDarkMode && styles.darkRatingCount]}>
                ({item.rating_count})
              </Text>
            )}
          </View>
        )}
        
        <View style={styles.productActions}>
          <TouchableOpacity
            style={[styles.addToCartButton, isDarkMode && styles.darkAddToCartButton]}
            onPress={() => handleAddToCart(item)}
            disabled={addingToCart === item.id}
          >
            {addingToCart === item.id ? (
              <ActivityIndicator size="small" color={isDarkMode ? "#000000" : "#FFFFFF"} />
            ) : (
              <Text style={[styles.addToCartText, isDarkMode && styles.darkAddToCartText]}>
                Add to Cart
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.removeButton, isDarkMode && styles.darkRemoveButton]}
            onPress={() => handleRemoveFavorite(item.id, item.title)}
          >
            <Ionicons 
              name="heart-dislike" 
              size={20} 
              color={isDarkMode ? "#F87171" : "#EF4444"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (!fontsLoaded) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.darkLoadingContainer]}>
        <ActivityIndicator size="large" color="#232CAD" />
        <Text style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}>Loading...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <View style={[styles.header, isDarkMode && styles.darkHeader]}>
          <TouchableOpacity 
            style={[styles.backButton, isDarkMode && styles.darkBackButton]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={isDarkMode ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>My Favorites</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>
        <View style={[styles.loadingContent, isDarkMode && styles.darkLoadingContent]}>
          <ActivityIndicator size="large" color="#232CAD" />
          <Text style={[styles.loadingContentText, isDarkMode && styles.darkLoadingContentText]}>
            Loading favorites...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity 
          style={[styles.backButton, isDarkMode && styles.darkBackButton]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>
          My Favorites ({favorites.length})
        </Text>
        {favorites.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={handleClearAllFavorites}
          >
            <Text style={[styles.clearText, isDarkMode && styles.darkClearText]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={[styles.scrollView, isDarkMode && styles.darkScrollView]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? '#BB86FC' : '#232CAD'}
          />
        }
      >
        {favorites.length === 0 ? (
          <View style={[styles.emptyContainer, isDarkMode && styles.darkEmptyContainer]}>
            <Text style={[styles.emptyIcon, isDarkMode && styles.darkEmptyIcon]}>❤️</Text>
            <Text style={[styles.emptyTitle, isDarkMode && styles.darkEmptyTitle]}>
              No Favorites Yet
            </Text>
            <Text style={[styles.emptyMessage, isDarkMode && styles.darkEmptyMessage]}>
              Tap the heart icon on any product to add it to your favorites
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
          <View style={styles.productsContainer}>
            <FlatList
              data={favorites}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.productsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContentText: {
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
  headerRightPlaceholder: {
    width: 40,
  },
  // Scroll View
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  // Products
  productsContainer: {
    width: '100%',
  },
  productsList: {
    paddingBottom: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productImageContainer: {
    marginRight: 12,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  productImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#232CAD',
    marginRight: 8,
  },
  comparePrice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    marginRight: 4,
  },
  ratingCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#232CAD',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginRight: 12,
  },
  addToCartText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    textAlign: 'center',
  },
  emptyMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
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
  bottomSpacer: {
    height: 20,
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
  darkLoadingContent: {
    backgroundColor: '#121212',
  },
  darkLoadingContentText: {
    color: '#CCCCCC',
  },
  darkHeader: {
    borderBottomColor: '#333333',
  },
  darkHeaderTitle: {
    color: '#FFFFFF',
  },
  darkBackButton: {
    // Dark mode styles for back button - ADDED THIS
  },
  darkClearText: {
    color: '#F87171',
  },
  darkScrollView: {
    backgroundColor: '#121212',
  },
  darkProductCard: {
    backgroundColor: '#2D2D2D',
    borderColor: '#444444',
  },
  darkProductImagePlaceholder: {
    backgroundColor: '#3D3D3D',
  },
  darkProductTitle: {
    color: '#FFFFFF',
  },
  darkProductPrice: {
    color: '#BB86FC',
  },
  darkComparePrice: {
    color: '#888888',
  },
  darkRatingText: {
    color: '#AAAAAA',
  },
  darkRatingCount: {
    color: '#888888',
  },
  darkAddToCartButton: {
    backgroundColor: '#BB86FC',
  },
  darkAddToCartText: {
    color: '#000000',
  },
  darkRemoveButton: {
    backgroundColor: '#422B2B',
  },
  darkEmptyContainer: {
    backgroundColor: '#121212',
  },
  darkEmptyIcon: {
    color: '#F87171',
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
});