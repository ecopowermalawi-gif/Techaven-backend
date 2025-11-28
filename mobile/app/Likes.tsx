import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Likes() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });

  const [likedItems, setLikedItems] = useState([
    {
      id: '1',
      name: 'Wireless Earbuds Pro',
      price: 129.99,
      originalPrice: 149.99,
      rating: 4.5,
      icon: '🎧',
      isLiked: true,
    },
    {
      id: '2',
      name: 'Smart Watch Series X',
      price: 249.99,
      originalPrice: 299.99,
      rating: 4.8,
      icon: '⌚',
      isLiked: true,
    },
    {
      id: '3',
      name: 'Bluetooth Speaker Max',
      price: 179.99,
      originalPrice: 199.99,
      rating: 4.7,
      icon: '🔊',
      isLiked: true,
    },
    {
      id: '4',
      name: 'Gaming Headset Pro',
      price: 159.99,
      originalPrice: 189.99,
      rating: 4.6,
      icon: '🎮',
      isLiked: true,
    },
    {
      id: '5',
      name: 'Phone Case Premium',
      price: 39.99,
      originalPrice: 49.99,
      rating: 4.4,
      icon: '📱',
      isLiked: true,
    },
    {
      id: '6',
      name: 'Ultra Slim Laptop',
      price: 999.99,
      originalPrice: 1199.99,
      rating: 4.9,
      icon: '💻',
      isLiked: true,
    },
  ]);

  const router = useRouter();

  const toggleLike = (id: string) => {
    setLikedItems(prevItems => 
      prevItems.filter(item => item.id !== id)
    );
  };

  const moveToCart = (item: any) => {
    // Here you would typically add the item to cart
    // For now, we'll just show an alert
    alert(`Added ${item.name} to cart!`);
  };

  const clearAllLikes = () => {
    if (likedItems.length === 0) return;
    
    setLikedItems([]);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderLikedItem = ({ item }: { item: typeof likedItems[0] }) => (
    <View style={styles.likedItem}>
      <View style={styles.itemLeft}>
        <View style={styles.itemIconContainer}>
          <Text style={styles.itemIcon}>{item.icon}</Text>
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${item.price.toFixed(2)}</Text>
            <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {item.rating}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => moveToCart(item)}
        >
          <Text style={styles.cartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={() => toggleLike(item.id)}
        >
          <Text style={styles.likeButtonText}>❤️</Text>
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
            <Text style={styles.headerTitle}>My Likes</Text>
            {likedItems.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearAllLikes}
              >
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Likes Count */}
          <View style={styles.likesCountSection}>
            <Text style={styles.likesCountText}>
              {likedItems.length} {likedItems.length === 1 ? 'item' : 'items'} liked
            </Text>
          </View>

          {/* Liked Items */}
          {likedItems.length === 0 ? (
            <View style={styles.emptyLikes}>
              <Text style={styles.emptyLikesIcon}>❤️</Text>
              <Text style={styles.emptyLikesTitle}>No liked items yet</Text>
              <Text style={styles.emptyLikesText}>
                Start exploring our products and tap the heart icon to save items you love
              </Text>
              <TouchableOpacity 
                style={styles.startShoppingButton}
                onPress={() => router.back()}
              >
                <Text style={styles.startShoppingText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.likedItemsSection}>
              <FlatList
                data={likedItems}
                renderItem={renderLikedItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.likedItemsList}
              />
            </View>
          )}

          {/* Recommendations */}
          {likedItems.length > 0 && (
            <View style={styles.recommendationsSection}>
              <Text style={styles.sectionTitle}>You Might Also Like</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendationsList}
              >
                <TouchableOpacity style={styles.recommendationCard}>
                  <View style={styles.recommendationIcon}>
                    <Text style={styles.recommendationEmoji}>⌚</Text>
                  </View>
                  <Text style={styles.recommendationName} numberOfLines={2}>Fitness Tracker</Text>
                  <Text style={styles.recommendationPrice}>$79.99</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.recommendationCard}>
                  <View style={styles.recommendationIcon}>
                    <Text style={styles.recommendationEmoji}>📱</Text>
                  </View>
                  <Text style={styles.recommendationName} numberOfLines={2}>Wireless Charger</Text>
                  <Text style={styles.recommendationPrice}>$29.99</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.recommendationCard}>
                  <View style={styles.recommendationIcon}>
                    <Text style={styles.recommendationEmoji}>🎧</Text>
                  </View>
                  <Text style={styles.recommendationName} numberOfLines={2}>Noise Cancelling</Text>
                  <Text style={styles.recommendationPrice}>$199.99</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </ScrollView>
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
  clearButton: {
    padding: 8,
  },
  clearText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#FF3B30',
  },
  // Likes Count Section
  likesCountSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F8F8F8',
  },
  likesCountText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#666666',
  },
  // Empty Likes Styles
  emptyLikes: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyLikesIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  emptyLikesTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyLikesText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  startShoppingButton: {
    backgroundColor: '#232CAD',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  startShoppingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  // Liked Items Section
  likedItemsSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  likedItemsList: {
    paddingBottom: 16,
  },
  likedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#F2F2FF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemIcon: {
    fontSize: 24,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#000000',
    marginBottom: 6,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentPrice: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#232CAD',
    marginRight: 8,
  },
  originalPrice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
  },
  itemActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  cartButton: {
    backgroundColor: '#232CAD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 80,
  },
  cartButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  likeButton: {
    padding: 4,
  },
  likeButtonText: {
    fontSize: 16,
  },
  // Recommendations Section
  recommendationsSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
    marginBottom: 16,
  },
  recommendationsList: {
    paddingRight: 24,
    gap: 12,
  },
  recommendationCard: {
    width: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recommendationIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#F2F2FF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationEmoji: {
    fontSize: 20,
  },
  recommendationName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 14,
  },
  recommendationPrice: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#232CAD',
  },
});