import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Dimensions, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  FlatList,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Type definitions
interface SpecialOffer {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  image: string;
  isFeatured: boolean;
  isLimited: boolean;
  timeLeft?: string;
  tags: string[];
  colors: string[];
  inStock: boolean;
  isFavorite: boolean;
  badge?: string;
}

interface FilterOption {
  label: string;
  value: string;
  icon: string;
}

// Special Offers data
const SPECIAL_OFFERS_DATA: SpecialOffer[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    description: 'Titanium design, A17 Pro chip',
    price: 1099,
    originalPrice: 1399,
    discount: 21,
    rating: 4.9,
    reviewCount: 892,
    image: '📱',
    isFeatured: true,
    isLimited: true,
    timeLeft: '2 days left',
    tags: ['Limited', 'Best Deal'],
    colors: ['#2C2C2E', '#FFFFFF', '#FF375F'],
    inStock: true,
    isFavorite: true,
    badge: 'FLASH SALE',
  },
  {
    id: '2',
    name: 'MacBook Pro 16"',
    description: 'M3 Max chip, 16-core GPU',
    price: 2399,
    originalPrice: 2999,
    discount: 20,
    rating: 4.9,
    reviewCount: 567,
    image: '💻',
    isFeatured: true,
    isLimited: false,
    tags: ['Featured'],
    colors: ['#2C2C2E', '#A2AAAD'],
    inStock: true,
    isFavorite: false,
    badge: 'HOT DEAL',
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5',
    description: 'Industry leading noise cancellation',
    price: 349,
    originalPrice: 449,
    discount: 22,
    rating: 4.7,
    reviewCount: 2341,
    image: '🎧',
    isFeatured: false,
    isLimited: true,
    timeLeft: '1 day left',
    tags: ['Limited'],
    colors: ['#000000', '#C0C0C0'],
    inStock: true,
    isFavorite: true,
    badge: 'FLASH SALE',
  },
  {
    id: '4',
    name: 'Apple Watch Ultra 2',
    description: 'Most rugged and capable Apple Watch',
    price: 749,
    originalPrice: 899,
    discount: 17,
    rating: 4.8,
    reviewCount: 423,
    image: '⌚',
    isFeatured: true,
    isLimited: false,
    tags: ['New'],
    colors: ['#2C2C2E', '#FFD700'],
    inStock: true,
    isFavorite: false,
    badge: 'SPECIAL OFFER',
  },
  {
    id: '5',
    name: 'Samsung Galaxy Z Fold5',
    description: 'Foldable smartphone experience',
    price: 1599,
    originalPrice: 1999,
    discount: 20,
    rating: 4.6,
    reviewCount: 321,
    image: '📱',
    isFeatured: false,
    isLimited: true,
    timeLeft: '3 days left',
    tags: ['Limited', 'Premium'],
    colors: ['#2C2C2E', '#7C53E7'],
    inStock: true,
    isFavorite: false,
    badge: 'LIMITED TIME',
  },
  {
    id: '6',
    name: 'AirPods Max',
    description: 'High-fidelity audio',
    price: 479,
    originalPrice: 549,
    discount: 13,
    rating: 4.7,
    reviewCount: 1892,
    image: '🎧',
    isFeatured: true,
    isLimited: false,
    tags: ['Popular'],
    colors: ['#FFFFFF', '#2C2C2E', '#FF375F'],
    inStock: true,
    isFavorite: true,
    badge: 'DEAL OF DAY',
  },
  {
    id: '7',
    name: 'iPad Pro 12.9"',
    description: 'M2 chip, Liquid Retina XDR',
    price: 1099,
    originalPrice: 1299,
    discount: 15,
    rating: 4.8,
    reviewCount: 756,
    image: '📱',
    isFeatured: false,
    isLimited: false,
    tags: ['Tablet'],
    colors: ['#2C2C2E', '#FFFFFF'],
    inStock: true,
    isFavorite: false,
    badge: 'WEEKEND DEAL',
  },
  {
    id: '8',
    name: 'PlayStation 5',
    description: 'Next-gen gaming console',
    price: 449,
    originalPrice: 499,
    discount: 10,
    rating: 4.9,
    reviewCount: 3124,
    image: '🎮',
    isFeatured: true,
    isLimited: true,
    timeLeft: '6 hours left',
    tags: ['Limited', 'Gaming'],
    colors: ['#FFFFFF'],
    inStock: true,
    isFavorite: true,
    badge: 'FLASH SALE',
  },
];

const FILTER_OPTIONS: FilterOption[] = [
  { label: 'All Offers', value: 'all', icon: 'flash' },
  { label: 'Flash Sales', value: 'flash', icon: 'bolt' },
  { label: 'Limited Time', value: 'limited', icon: 'time' },
  { label: 'Featured', value: 'featured', icon: 'star' },
  { label: 'Best Deals', value: 'best', icon: 'trending-up' },
];

const SORT_OPTIONS = [
  { label: 'Discount: High to Low', value: 'discount-high' },
  { label: 'Discount: Low to High', value: 'discount-low' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'Ending Soon', value: 'ending' },
];

export default function SpecialOffersScreen() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('discount-high');
  const [showSortModal, setShowSortModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(['1', '3', '6', '8']);
  
  const router = useRouter();

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Filter and sort special offers
  const filteredOffers = SPECIAL_OFFERS_DATA.filter(offer => {
    const matchesSearch = offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'flash' && offer.badge?.includes('FLASH')) ||
                         (activeFilter === 'limited' && offer.isLimited) ||
                         (activeFilter === 'featured' && offer.isFeatured) ||
                         (activeFilter === 'best' && offer.discount >= 20);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'discount-low':
        return a.discount - b.discount;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'ending':
        // Simple sorting for time left (you might want to implement proper time comparison)
        return a.timeLeft && b.timeLeft ? a.timeLeft.localeCompare(b.timeLeft) : 0;
      case 'discount-high':
      default:
        return b.discount - a.discount;
    }
  });

  const toggleFavorite = (offerId: string) => {
    setFavorites(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  const handleOfferPress = (offerId: string) => {
    // Navigate to product details page
    router.push({
      pathname: '/product' as any,
      params: { id: offerId }
    });
  };

  const SpecialOfferCard: React.FC<{ offer: SpecialOffer }> = ({ offer }) => {
    const isFavorite = favorites.includes(offer.id);
    
    return (
      <TouchableOpacity 
        style={styles.offerCard}
        activeOpacity={0.9}
        onPress={() => handleOfferPress(offer.id)}
      >
        {/* Offer Badge */}
        {offer.badge && (
          <View style={[
            styles.offerBadge,
            offer.badge.includes('FLASH') && styles.flashBadge,
            offer.badge.includes('LIMITED') && styles.limitedBadge,
            offer.badge.includes('DEAL') && styles.dealBadge,
          ]}>
            <Text style={styles.offerBadgeText}>{offer.badge}</Text>
            {offer.timeLeft && (
              <Text style={styles.timeLeftText}>{offer.timeLeft}</Text>
            )}
          </View>
        )}

        {/* Product Image & Tags */}
        <View style={styles.productImageContainer}>
          <View style={styles.productImage}>
            <Text style={styles.productEmoji}>{offer.image}</Text>
          </View>
          
          {/* Tags */}
          <View style={styles.tagsContainer}>
            {offer.tags.map((tag, index) => (
              <View 
                key={tag} 
                style={[
                  styles.tag,
                  index === 0 && styles.firstTag
                ]}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Favorite Button */}
          <TouchableOpacity 
            style={[
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive
            ]}
            onPress={() => toggleFavorite(offer.id)}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite ? "#FFFFFF" : "#64748B"} 
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{offer.name}</Text>
          <Text style={styles.productDescription} numberOfLines={1}>
            {offer.description}
          </Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              <FontAwesome name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{offer.rating}</Text>
            </View>
            <Text style={styles.reviewCount}>({offer.reviewCount})</Text>
          </View>

          {/* Price & Discount */}
          <View style={styles.priceContainer}>
            <View style={styles.priceLeft}>
              <Text style={styles.currentPrice}>${offer.price}</Text>
              <Text style={styles.originalPrice}>${offer.originalPrice}</Text>
            </View>
            <View style={styles.discountPill}>
              <Text style={styles.discountPillText}>-{offer.discount}%</Text>
            </View>
          </View>

          {/* You Save */}
          <View style={styles.savingsContainer}>
            <Text style={styles.savingsText}>
              You save ${offer.originalPrice - offer.price}
            </Text>
          </View>

          {/* Colors */}
          <View style={styles.colorsContainer}>
            {offer.colors.map((color, index) => (
              <View 
                key={index} 
                style={[
                  styles.colorDot,
                  { backgroundColor: color },
                  index === 0 && styles.activeColorDot
                ]} 
              />
            ))}
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity style={styles.addToCartButton}>
            <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterButton: React.FC<{ 
    option: FilterOption; 
    isActive: boolean; 
    onPress: (value: string) => void; 
  }> = ({ option, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.activeFilterButton]}
      onPress={() => onPress(option.value)}
    >
      <Ionicons 
        name={option.icon as any} 
        size={16} 
        color={isActive ? "#FFFFFF" : "#64748B"} 
        style={styles.filterIcon}
      />
      <Text style={[styles.filterButtonText, isActive && styles.activeFilterButtonText]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const SortModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Sort Offers</Text>
          <TouchableOpacity onPress={() => setShowSortModal(false)}>
            <Ionicons name="close" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
        
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.sortOption,
              sortBy === option.value && styles.activeSortOption
            ]}
            onPress={() => {
              setSortBy(option.value);
              setShowSortModal(false);
            }}
          >
            <Text style={[
              styles.sortOptionText,
              sortBy === option.value && styles.activeSortOptionText
            ]}>
              {option.label}
            </Text>
            {sortBy === option.value && (
              <Ionicons name="checkmark" size={20} color="#232CAD" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Special Offers</Text>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color="#000000" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <LinearGradient
            colors={['#232CAD', '#4F46E5']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Exclusive Deals</Text>
              <Text style={styles.heroSubtitle}>
                Limited time offers with massive discounts
              </Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{SPECIAL_OFFERS_DATA.length}</Text>
                  <Text style={styles.heroStatLabel}>Active Offers</Text>
                </View>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>
                    {Math.max(...SPECIAL_OFFERS_DATA.map(o => o.discount))}%
                  </Text>
                  <Text style={styles.heroStatLabel}>Max Discount</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search special offers..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{filteredOffers.length}</Text>
            <Text style={styles.statLabel}>Offers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {filteredOffers.filter(o => o.isLimited).length}
            </Text>
            <Text style={styles.statLabel}>Limited</Text>
          </View>
          <View style={styles.statDivider} />
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="filter" size={16} color="#64748B" />
            <Text style={styles.statLabel}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {FILTER_OPTIONS.map((option) => (
              <FilterButton 
                key={option.value}
                option={option}
                isActive={activeFilter === option.value}
                onPress={setActiveFilter}
              />
            ))}
          </ScrollView>
        </View>

        {/* Offers Grid */}
        <View style={styles.offersSection}>
          <Text style={styles.sectionTitle}>
            {activeFilter === 'all' ? 'All Special Offers' : 
             activeFilter === 'flash' ? 'Flash Sales' :
             activeFilter === 'limited' ? 'Limited Time Offers' :
             activeFilter === 'featured' ? 'Featured Offers' : 'Best Deals'}
          </Text>
          
          <FlatList
            data={filteredOffers}
            renderItem={({ item }) => <SpecialOfferCard offer={item} />}
            keyExtractor={(item: SpecialOffer) => item.id}
            scrollEnabled={false}
            numColumns={2}
            contentContainerStyle={styles.offersGrid}
            columnWrapperStyle={styles.offersRow}
          />
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sort Modal */}
      {showSortModal && <SortModal />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#000000',
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroBanner: {
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  heroGradient: {
    padding: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#000000',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    marginHorizontal: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  statValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#232CAD',
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  filterSection: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  filterScrollContent: {
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: '#232CAD',
    borderColor: '#232CAD',
  },
  filterIcon: {
    marginRight: 4,
  },
  filterButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
  },
  offersSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#000000',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  offersGrid: {
    paddingHorizontal: 20,
  },
  offersRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  offerCard: {
    width: (width - 56) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
  },
  offerBadge: {
    position: 'absolute',
    top: -6,
    left: 12,
    right: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
    alignItems: 'center',
  },
  flashBadge: {
    backgroundColor: '#EF4444',
  },
  limitedBadge: {
    backgroundColor: '#F59E0B',
  },
  dealBadge: {
    backgroundColor: '#10B981',
  },
  offerBadgeText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  timeLeftText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 8,
    color: '#FFFFFF',
    marginTop: 2,
  },
  productImageContainer: {
    position: 'relative',
    marginBottom: 12,
    marginTop: 8,
  },
  productImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productEmoji: {
    fontSize: 36,
  },
  tagsContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    backgroundColor: '#232CAD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  firstTag: {
    backgroundColor: '#10B981',
  },
  tagText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 8,
    color: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  favoriteButtonActive: {
    backgroundColor: '#EF4444',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
    lineHeight: 18,
  },
  productDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#000000',
  },
  reviewCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#94A3B8',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentPrice: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#232CAD',
  },
  originalPrice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  discountPill: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountPillText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  savingsContainer: {
    marginBottom: 8,
  },
  savingsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#10B981',
  },
  colorsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeColorDot: {
    borderWidth: 2,
    borderColor: '#232CAD',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#232CAD',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addToCartText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activeSortOption: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  sortOptionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#64748B',
  },
  activeSortOptionText: {
    color: '#232CAD',
    fontFamily: 'Poppins-SemiBold',
  },
});