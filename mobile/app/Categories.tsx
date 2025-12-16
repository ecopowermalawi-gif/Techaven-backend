import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiService from './services/api';
import { useTheme } from './context/ThemeContext';

const { width } = Dimensions.get('window');

// Type definition
interface Category {
  id: string;
  name: string;
  description?: string;
  product_count?: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface CategoryGridItemProps {
  item: Category;
  index: number;
  onPress: (id: string, name: string) => void;
  isDarkMode?: boolean;
}

// Icon mapping for categories
const getCategoryIcon = (categoryName: string): { icon: string; color: string } => {
  const lowerName = categoryName.toLowerCase();
  
  const iconMap: Record<string, { icon: string; color: string }> = {
    'phone': { icon: '📱', color: '#6366F1' },
    'smartphone': { icon: '📱', color: '#6366F1' },
    'computer': { icon: '💻', color: '#06B6D4' },
    'laptop': { icon: '💻', color: '#06B6D4' },
    'wearable': { icon: '⌚', color: '#10B981' },
    'watch': { icon: '⌚', color: '#10B981' },
    'headphone': { icon: '🎧', color: '#F59E0B' },
    'audio': { icon: '🎧', color: '#F59E0B' },
    'speaker': { icon: '🔊', color: '#F59E0B' },
    'tablet': { icon: '📱', color: '#EF4444' },
    'ipad': { icon: '📱', color: '#EF4444' },
    'camera': { icon: '📸', color: '#8B5CF6' },
    'gaming': { icon: '🎮', color: '#EC4899' },
    'console': { icon: '🎮', color: '#EC4899' },
    'accessory': { icon: '🔌', color: '#14B8A6' },
    'charger': { icon: '🔌', color: '#14B8A6' },
    'home': { icon: '🏠', color: '#F97316' },
    'appliance': { icon: '🏠', color: '#F97316' },
    'tv': { icon: '📺', color: '#3B82F6' },
    'monitor': { icon: '🖥️', color: '#3B82F6' },
    'storage': { icon: '💾', color: '#8B5CF6' },
    'network': { icon: '📡', color: '#0EA5E9' },
    'router': { icon: '📡', color: '#0EA5E9' },
    'software': { icon: '💿', color: '#6366F1' },
    'book': { icon: '📚', color: '#84CC16' },
  };

  // Check for matches
  for (const key in iconMap) {
    if (lowerName.includes(key)) {
      return iconMap[key];
    }
  }

  // Default fallback
  const defaultColors = [
    '#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#3B82F6'
  ];
  const defaultIcon = '📦';
  const colorIndex = categoryName.length % defaultColors.length;
  
  return {
    icon: defaultIcon,
    color: defaultColors[colorIndex]
  };
};

export default function CategoriesScreen() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const router = useRouter();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Fetch categories from API
      const response = await apiService.getProducts({ 
        group_by: 'category',
        limit: 50 
      });
      
      if (response && response.categories) {
        setCategories(response.categories);
      } else {
        setCategories([]);
      }
      
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      
      let errorMessage = 'Failed to load categories';
      if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
      setCategories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    router.push(`/category/${categoryId}?name=${encodeURIComponent(categoryName)}` as any);
  };

  const CategoryGridItem: React.FC<CategoryGridItemProps> = ({ item, index, onPress, isDarkMode = false }) => {
    const { icon, color } = getCategoryIcon(item.name);
    
    return (
      <View style={styles.gridItemContainer}>
        <TouchableOpacity 
          style={[
            styles.gridItem,
            isDarkMode && styles.darkGridItem
          ]}
          activeOpacity={0.9}
          onPress={() => onPress(item.id, item.name)}
        >
          <View style={[styles.gridIconContainer, { backgroundColor: `${color}15` }]}>
            <Text style={[styles.gridIcon, { color }]}>{icon}</Text>
          </View>
        </TouchableOpacity>
        <Text style={[
          styles.gridName,
          isDarkMode && styles.darkGridName
        ]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.product_count !== undefined && (
          <Text style={[
            styles.productCount,
            isDarkMode && styles.darkProductCount
          ]}>
            {item.product_count} {item.product_count === 1 ? 'product' : 'products'}
          </Text>
        )}
      </View>
    );
  };

  if (!fontsLoaded) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.darkLoadingContainer]}>
        <ActivityIndicator size="large" color="#232CAD" />
        <Text style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}>Loading...</Text>
      </View>
    );
  }

  if (loading && !refreshing) {
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
          <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>Categories</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>
        <View style={[styles.loadingContent, isDarkMode && styles.darkLoadingContent]}>
          <ActivityIndicator size="large" color="#232CAD" />
          <Text style={[styles.loadingContentText, isDarkMode && styles.darkLoadingContentText]}>
            Loading categories...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Group categories into rows of 3
  const groupedCategories = [];
  for (let i = 0; i < categories.length; i += 3) {
    groupedCategories.push(categories.slice(i, i + 3));
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
        <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>Categories</Text>
        <View style={styles.headerRightPlaceholder} />
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
        {/* Frame 623: "All Categories" Header */}
        <View style={styles.sectionHeaderFrame}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>
            All Categories
          </Text>
          {categories.length > 0 && (
            <Text style={[styles.categoryCount, isDarkMode && styles.darkCategoryCount]}>
              {categories.length} categories
            </Text>
          )}
        </View>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <View style={styles.gridContainer}>
            {groupedCategories.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.gridRow}>
                {row.map((category, colIndex) => (
                  <CategoryGridItem 
                    key={category.id}
                    item={category}
                    index={rowIndex * 3 + colIndex}
                    onPress={handleCategoryPress}
                    isDarkMode={isDarkMode}
                  />
                ))}
                {/* Fill empty spots if row has less than 3 items */}
                {row.length < 3 && (
                  Array.from({ length: 3 - row.length }).map((_, index) => (
                    <View key={`empty-${index}`} style={styles.emptyGridItem} />
                  ))
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyContainer, isDarkMode && styles.darkEmptyContainer]}>
            <Text style={[styles.emptyIcon, isDarkMode && styles.darkEmptyIcon]}>📂</Text>
            <Text style={[styles.emptyTitle, isDarkMode && styles.darkEmptyTitle]}>
              No Categories Found
            </Text>
            <Text style={[styles.emptyMessage, isDarkMode && styles.darkEmptyMessage]}>
              No categories available at the moment.
            </Text>
            <TouchableOpacity 
              style={[styles.retryButton, isDarkMode && styles.darkRetryButton]}
              onPress={fetchCategories}
            >
              <Text style={[styles.retryText, isDarkMode && styles.darkRetryText]}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Light mode styles
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#000000',
  },
  headerRightPlaceholder: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  // Frame 623: All Categories Header
  sectionHeaderFrame: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: '#0C1A30',
  },
  categoryCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  // Frame 650: Grid Container
  gridContainer: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    width: '100%',
  },
  gridItemContainer: {
    alignItems: 'center',
    width: (width - 60) / 3,
  },
  gridItem: {
    width: '100%',
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  emptyGridItem: {
    width: (width - 60) / 3,
  },
  gridIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridIcon: {
    fontSize: 28,
  },
  gridName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#0C1A30',
    textAlign: 'center',
    width: '100%',
    marginBottom: 2,
  },
  productCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    width: '100%',
  },
  // Empty state
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
  },
  retryButton: {
    backgroundColor: '#232CAD',
    borderRadius: 25,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  retryText: {
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
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333333',
  },
  darkBackButton: {
    backgroundColor: '#2D2D2D',
  },
  darkHeaderTitle: {
    color: '#FFFFFF',
  },
  darkScrollView: {
    backgroundColor: '#121212',
  },
  darkSectionTitle: {
    color: '#FFFFFF',
  },
  darkCategoryCount: {
    color: '#AAAAAA',
  },
  darkGridItem: {
    backgroundColor: '#2D2D2D',
    borderColor: '#444444',
  },
  darkGridName: {
    color: '#FFFFFF',
  },
  darkProductCount: {
    color: '#AAAAAA',
  },
  darkEmptyContainer: {
    backgroundColor: '#121212',
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
  darkRetryButton: {
    backgroundColor: '#BB86FC',
  },
  darkRetryText: {
    color: '#000000',
  },
});