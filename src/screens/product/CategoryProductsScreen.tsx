import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import { useGetProductsByCategoryQuery } from "../../api/productApi";
import { useGetCategoryQuery } from "../../api/productApi";
import { Product } from "../../types/api.types";
import { colors, spacing, fontSize, fontWeight, borderRadius } from "../../theme";
import { ProductCard } from "../../components/product/ProductCard";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { API_BASE_URL } from "../../api/baseApi";

const CategoryProductsScreen = ({ route, navigation }: any) => {
  const { categoryId, categoryName } = route.params;

  const {
    data: productsData,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useGetProductsByCategoryQuery(categoryId);

  const {
    data: categoryData,
    isLoading: categoryLoading,
  } = useGetCategoryQuery(categoryId);

  const products = productsData?.data || [];
  const category = categoryData?.data;

  const onRefresh = () => {
    refetchProducts();
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
        navigation.navigate("ProductDetail", {
          id: item.productId,
        })
      }
    />
  );

  if (productsLoading || categoryLoading) {
    return <LoadingState message="กำลังโหลดสินค้า..." />;
  }

  const categoryImageUrl = category?.imageUrl && !category.imageUrl.startsWith('http')
    ? `${API_BASE_URL}${category.imageUrl}`
    : category?.imageUrl;

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
          <View style={styles.headerContainer}>
            {/* Category Image */}
            {categoryImageUrl ? (
              <Image
                source={{ uri: categoryImageUrl }}
                style={styles.categoryImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.categoryImagePlaceholder}>
                <Icon name="shape" size={64} color={colors.primary} />
              </View>
            )}

            {/* Category Info */}
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>
                {category?.categoryName || categoryName}
              </Text>
              {category?.description && (
                <Text style={styles.categoryDescription}>
                  {category.description}
                </Text>
              )}
              <Text style={styles.productCount}>
                สินค้าทั้งหมด {products.length} รายการ
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="package-variant"
            message="ไม่มีสินค้า"
            description={`ยังไม่มีสินค้าในหมวดหมู่ ${categoryName}`}
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
  headerContainer: {
    backgroundColor: colors.surface,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  categoryImage: {
    width: "100%",
    height: 180,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
  },
  categoryImagePlaceholder: {
    width: "100%",
    height: 180,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.divider,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.base,
  },
  categoryInfo: {
    width: "100%",
    alignItems: "center",
  },
  categoryTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  categoryDescription: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  productCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
});

export default CategoryProductsScreen;
