import React from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { useGetProductsQuery } from "../../api/productApi";
import { Product } from "../../types/api.types";
import { colors, spacing, fontSize, fontWeight } from "../../theme";
import { ProductCard } from "../../components/product/ProductCard";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";

const HomeScreen = ({ navigation }: any) => {
  const {
    data: productsData,
    isLoading,
    refetch,
  } = useGetProductsQuery({ pageSize: 20 });

  const products = productsData?.data || [];

  const onRefresh = () => {
    refetch();
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

  if (isLoading) {
    return <LoadingState message="กำลังโหลดสินค้า..." />;
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
});

export default HomeScreen;
