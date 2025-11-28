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
import { useFonts, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Type definitions
interface CategoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: [string, string];
  items: string;
  isFeatured: boolean;
}

interface FilterButtonProps {
  label: string;
  value: string;
  isActive: boolean;
  onPress: (value: string) => void;
}

interface FeaturedCategoryCardProps {
  item: CategoryItem;
  onPress: (id: string) => void;
}

interface RegularCategoryCardProps {
  item: CategoryItem;
  onPress: (id: string) => void;
}

// Category data
const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: '1',
    name: 'Smartphones',
    description: 'Latest models & accessories',
    icon: '📱',
    color: '#6366F1',
    gradient: ['#6366F1', '#8B5CF6'] as [string, string],
    items: '124 products',
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Laptops',
    description: 'Gaming, Business & More',
    icon: '💻',
    color: '#06B6D4',
    gradient: ['#06B6D4', '#0EA5E9'] as [string, string],
    items: '89 products',
    isFeatured: true,
  },
  {
    id: '3',
    name: 'Audio',
    description: 'Headphones & Speakers',
    icon: '🎧',
    color: '#10B981',
    gradient: ['#10B981', '#34D399'] as [string, string],
    items: '67 products',
    isFeatured: false,
  },
  {
    id: '4',
    name: 'Smart Watches',
    description: 'Fitness & Lifestyle',
    icon: '⌚',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#FBBF24'] as [string, string],
    items: '45 products',
    isFeatured: true,
  },
  {
    id: '5',
    name: 'Tablets',
    description: 'iPad & Android Tablets',
    icon: '📱',
    color: '#EF4444',
    gradient: ['#EF4444', '#F87171'] as [string, string],
    items: '32 products',
    isFeatured: false,
  },
  {
    id: '6',
    name: 'Gaming',
    description: 'Consoles & Accessories',
    icon: '🎮',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#A78BFA'] as [string, string],
    items: '78 products',
    isFeatured: true,
  },
  {
    id: '7',
    name: 'Cameras',
    description: 'DSLR & Mirrorless',
    icon: '📸',
    color: '#EC4899',
    gradient: ['#EC4899', '#F472B6'] as [string, string],
    items: '56 products',
    isFeatured: false,
  },
  {
    id: '8',
    name: 'Accessories',
    description: 'Cases, Cables & More',
    icon: '🔌',
    color: '#64748B',
    gradient: ['#64748B', '#94A3B8'] as [string, string],
    items: '203 products',
    isFeatured: false,
  },
];

export default function CategoriesScreen() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const router = useRouter();

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Filter categories based on search and active filter
  const filteredCategories = CATEGORIES_DATA.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'featured' && category.isFeatured);
    
    return matchesSearch && matchesFilter;
  });

  const handleCategoryPress = (categoryId: string) => {
    // Navigate to category details or products page
    // use a string path and cast to any to satisfy the router's generated route types
    router.push(`/category/${categoryId}` as unknown as any);
  };

  const FeaturedCategoryCard: React.FC<FeaturedCategoryCardProps> = ({ item, onPress }) => (
    <TouchableOpacity 
      style={styles.featuredCard}
      activeOpacity={0.9}
      onPress={() => onPress(item.id)}
    >
      <LinearGradient
        colors={item.gradient}
        style={styles.featuredGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.featuredContent}>
          <View style={styles.featuredIconContainer}>
            <Text style={styles.featuredIcon}>{item.icon}</Text>
          </View>
          <View style={styles.featuredTextContainer}>
            <Text style={styles.featuredName}>{item.name}</Text>
            <Text style={styles.featuredDescription}>{item.description}</Text>
            <Text style={styles.featuredItems}>{item.items}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" style={styles.chevron} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const RegularCategoryCard: React.FC<RegularCategoryCardProps> = ({ item, onPress }) => (
    <TouchableOpacity 
      style={styles.regularCard}
      activeOpacity={0.9}
      onPress={() => onPress(item.id)}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.regularGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.regularIconContainer, { backgroundColor: `${item.color}15` }]}>
          <Text style={[styles.regularIcon, { color: item.color }]}>{item.icon}</Text>
        </View>
        <View style={styles.regularTextContainer}>
          <Text style={styles.regularName}>{item.name}</Text>
          <Text style={styles.regularDescription}>{item.description}</Text>
          <Text style={styles.regularItems}>{item.items}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const FilterButton: React.FC<FilterButtonProps> = ({ label, value, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.activeFilterButton]}
      onPress={() => onPress(value)}
    >
      <Text style={[styles.filterButtonText, isActive && styles.activeFilterButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const handleFilterPress = (filterValue: string) => {
    setActiveFilter(filterValue);
  };

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
        <Text style={styles.headerTitle}>Categories</Text>
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
        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search categories..."
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

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            <FilterButton 
              label="All" 
              value="all" 
              isActive={activeFilter === 'all'} 
              onPress={handleFilterPress}
            />
            <FilterButton 
              label="Featured" 
              value="featured" 
              isActive={activeFilter === 'featured'} 
              onPress={handleFilterPress}
            />
            <FilterButton 
              label="Popular" 
              value="popular" 
              isActive={activeFilter === 'popular'} 
              onPress={handleFilterPress}
            />
            <FilterButton 
              label="New" 
              value="new" 
              isActive={activeFilter === 'new'} 
              onPress={handleFilterPress}
            />
          </ScrollView>
        </View>

        {/* Featured Categories */}
        {filteredCategories.filter(cat => cat.isFeatured).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Categories</Text>
            <FlatList
              data={filteredCategories.filter(cat => cat.isFeatured)}
              renderItem={({ item }) => (
                <FeaturedCategoryCard 
                  item={item} 
                  onPress={handleCategoryPress}
                />
              )}
              keyExtractor={(item: CategoryItem) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>
        )}

        {/* All Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Categories</Text>
            <Text style={styles.sectionCount}>{filteredCategories.length} categories</Text>
          </View>
          <FlatList
            data={filteredCategories}
            renderItem={({ item }) => (
              <RegularCategoryCard 
                item={item} 
                onPress={handleCategoryPress}
              />
            )}
            keyExtractor={(item: CategoryItem) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.regularList}
          />
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  filterSection: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  filterScrollContent: {
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeFilterButton: {
    backgroundColor: '#232CAD',
    borderColor: '#232CAD',
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
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#000000',
  },
  sectionCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  featuredList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  featuredCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  featuredGradient: {
    padding: 20,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featuredIcon: {
    fontSize: 28,
  },
  featuredTextContainer: {
    flex: 1,
  },
  featuredName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  featuredItems: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  chevron: {
    opacity: 0.8,
  },
  regularList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  regularCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  regularGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  regularIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  regularIcon: {
    fontSize: 20,
  },
  regularTextContainer: {
    flex: 1,
  },
  regularName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#000000',
    marginBottom: 2,
  },
  regularDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  regularItems: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: '#94A3B8',
  },
  arrowContainer: {
    padding: 4,
  },
  bottomSpacer: {
    height: 20,
  },
});