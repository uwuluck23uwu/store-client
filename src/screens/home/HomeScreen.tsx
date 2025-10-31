import React, { useState, useRef } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { useGetProductsQuery } from "../../api/productApi";
import { useGetActiveCategoriesQuery } from "../../api/productApi";
import { useGetActiveBannersQuery, AppBanner } from "../../api/bannerApi";
import { Product, Category } from "../../types/api.types";
import { colors, spacing, fontSize, fontWeight, borderRadius } from "../../theme";
import { ProductCard } from "../../components/product/ProductCard";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { API_BASE_URL } from "../../api/baseApi";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const HomeScreen = ({ navigation }: any) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerFlatListRef = useRef<FlatList>(null);

  const {
    data: productsData,
    isLoading,
    refetch,
  } = useGetProductsQuery({ pageSize: 20, isActive: true });

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useGetActiveCategoriesQuery();

  const {
    data: bannersData,
    isLoading: bannersLoading,
    refetch: refetchBanners,
  } = useGetActiveBannersQuery();

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];
  const banners = bannersData?.data || [];

  const onRefresh = () => {
    refetch();
    refetchCategories();
    refetchBanners();
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      id={item.productId}
      name={String(item.productName || "")}
      price={item.price}
      imageUrl={item.imageUrl}
      stock={item.stock}
      sellerName={String(item.sellerName || "")}
      onPress={() =>
        navigation.navigate("Products", {
          screen: "ProductDetail",
          params: { id: item.productId },
        })
      }
    />
  );

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const imageUrl = item.imageUrl && !item.imageUrl.startsWith('http')
      ? `${API_BASE_URL}${item.imageUrl}`
      : item.imageUrl;

    return (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() =>
          navigation.navigate("Products", {
            screen: "CategoryProducts",
            params: { categoryId: item.categoryId, categoryName: item.categoryName },
          })
        }
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.categoryImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.categoryImagePlaceholder}>
            <Icon name="shape" size={32} color={colors.primary} />
          </View>
        )}
        <Text style={styles.categoryName} numberOfLines={2}>
          {item.categoryName}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderBannerItem = ({ item }: { item: AppBanner }) => {
    return (
      <TouchableOpacity
        style={styles.bannerItem}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const onBannerViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentBannerIndex(viewableItems[0].index || 0);
    }
  }).current;

  if (isLoading || categoriesLoading) {
    return <LoadingState message="กำลังโหลดข้อมูล..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
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
        ListHeaderComponent={
          <>
            {/* Banners Carousel */}
            {banners.length > 0 && (
              <View style={styles.bannersSection}>
                <FlatList
                  ref={bannerFlatListRef}
                  horizontal
                  data={banners}
                  renderItem={renderBannerItem}
                  keyExtractor={(item) => item.appBannerId.toString()}
                  showsHorizontalScrollIndicator={false}
                  pagingEnabled
                  snapToAlignment="center"
                  snapToInterval={SCREEN_WIDTH}
                  decelerationRate="fast"
                  onViewableItemsChanged={onBannerViewableItemsChanged}
                  viewabilityConfig={{
                    itemVisiblePercentThreshold: 50,
                  }}
                />
                {banners.length > 1 && (
                  <View style={styles.paginationDots}>
                    {banners.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          index === currentBannerIndex && styles.dotActive,
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Categories Section */}
            {categories.length > 0 && (
              <View style={styles.categoriesSection}>
                <Text style={styles.sectionTitle}>หมวดหมู่สินค้า</Text>
                <FlatList
                  horizontal
                  data={categories}
                  renderItem={renderCategoryItem}
                  keyExtractor={(item) => item.categoryId.toString()}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesList}
                />
              </View>
            )}
            {/* Products Section Title */}
            <Text style={styles.sectionTitle}>สินค้าทั้งหมด</Text>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="package-variant"
            message="ไม่มีสินค้า"
            description="ยังไม่มีสินค้าในระบบ"
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
  listContent: {
    padding: spacing.sm,
  },
  bannersSection: {
    backgroundColor: colors.surface,
    marginBottom: spacing.base,
  },
  bannerItem: {
    width: SCREEN_WIDTH,
  },
  bannerImage: {
    width: SCREEN_WIDTH,
    height: 200,
    backgroundColor: colors.divider,
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.divider,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  categoriesSection: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.base,
    marginBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  categoriesList: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  categoryItem: {
    width: 100,
    marginRight: spacing.sm,
    alignItems: "center",
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.divider,
  },
  categoryImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.divider,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
});

export default HomeScreen;
