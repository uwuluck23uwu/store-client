import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  useGetProductsQuery,
  useLazySearchProductsQuery,
  useGetActiveCategoriesQuery,
} from '../../api/productApi';
import { Product } from '../../types/api.types';
import { colors, spacing, fontSize, fontWeight } from '../../theme';
import { ProductCard } from '../../components/product/ProductCard';
import { SearchBar } from '../../components/common/SearchBar';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { CategoryFilter } from '../../components/product/CategoryFilter';
import { SortButton, SortOption } from '../../components/product/SortButton';

const ProductListScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>('default');

  const {
    data: productsData,
    isLoading,
    refetch,
  } = useGetProductsQuery({ pageSize: 50 });

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetActiveCategoriesQuery();

  const [searchProducts, { data: searchData, isLoading: isSearchLoading }] =
    useLazySearchProductsQuery();

  // Get base products (from search or all products)
  const baseProducts =
    isSearching && searchData?.data
      ? searchData.data
      : productsData?.data || [];

  // Apply filters and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...baseProducts];

    // Filter by category
    if (selectedCategoryId !== null) {
      result = result.filter(
        (product) => product.categoryId === selectedCategoryId
      );
    }

    // Sort products
    switch (selectedSort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) =>
          a.productName.localeCompare(b.productName, 'th')
        );
        break;
      case 'stock-desc':
        result.sort((a, b) => b.stock - a.stock);
        break;
      default:
        // Keep default order
        break;
    }

    return result;
  }, [baseProducts, selectedCategoryId, selectedSort]);

  const loading = isSearching ? isSearchLoading : isLoading;
  const categories = categoriesData?.data || [];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    await searchProducts(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  const onRefresh = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSelectedCategoryId(null);
    setSelectedSort('default');
    refetch();
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      id={item.productId}
      name={String(item.productName || '')}
      price={item.price}
      imageUrl={item.imageUrl}
      stock={item.stock}
      sellerName={String(item.sellerName || '')}
      onPress={() =>
        navigation.navigate('ProductDetail', { id: item.productId })
      }
    />
  );

  if (loading) {
    return <LoadingState message="กำลังโหลดสินค้า..." />;
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="ค้นหาสินค้า..."
          onClear={handleClearSearch}
        />
      </View>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* Sort & Results Info */}
      <View style={styles.controlSection}>
        <Text style={styles.resultText}>
          พบ {filteredAndSortedProducts.length} รายการ
        </Text>
        <SortButton
          selectedSort={selectedSort}
          onSelectSort={setSelectedSort}
        />
      </View>

      {/* Product List */}
      <FlatList
        data={filteredAndSortedProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.productId.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="package-variant"
            message={
              selectedCategoryId !== null
                ? 'ไม่พบสินค้าในหมวดหมู่นี้'
                : isSearching
                ? 'ไม่พบสินค้าที่ค้นหา'
                : 'ไม่มีสินค้า'
            }
            description={
              selectedCategoryId !== null
                ? 'ลองเลือกหมวดหมู่อื่น'
                : isSearching
                ? 'ลองค้นหาด้วยคำอื่น'
                : 'ยังไม่มีสินค้าในระบบ'
            }
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  controlSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  resultText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.sm,
  },
});

export default ProductListScreen;
