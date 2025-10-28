import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../../api/productApi";
import { useGetLocationsQuery } from "../../api/locationApi";
import { useGetSellerByIdQuery } from "../../api/sellerApi";
import { useAuth } from "../../hooks/useAuth";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from "../../theme";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";
import { ProductCard } from "../../components/product/ProductCard";
import { FloatingActionButton } from "../../components/common";
import { PrimaryButton } from "../../components/common/PrimaryButton";
import { convertImageUrl } from "../../api/baseApi";

const StoreDetailScreen = ({ route, navigation }: any) => {
  const { sellerId } = route.params;
  const { user } = useAuth();

  // Get seller info directly
  const { data: sellerData, isLoading: sellerLoading } =
    useGetSellerByIdQuery(sellerId);
  const seller = sellerData?.data;

  const {
    data: productsData,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useGetProductsQuery({
    sellerId,
    pageSize: 100, // Get all products
  });
  const products = productsData?.data || [];

  const { data: locationsData } = useGetLocationsQuery();
  const locations = locationsData?.data || [];

  const [deleteProduct] = useDeleteProductMutation();

  // Multi-select state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(
    new Set()
  );

  // Find seller's store location
  const storeLocation = locations.find(
    (loc) => loc.sellerId === sellerId && loc.locationType === "Store"
  );

  const sellerName =
    seller?.shopName ||
    seller?.ownerName ||
    products[0]?.sellerName ||
    "ร้านค้า";
  const sellerDescription =
    seller?.shopDescription ||
    seller?.description ||
    storeLocation?.description;

  // Check if current user is the owner of this store
  const isOwnStore = user?.id === seller?.userId;

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedProducts(new Set());
  };

  // Toggle product selection
  const toggleProductSelection = (productId: number) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Select all products
  const selectAllProducts = () => {
    const allProductIds = products.map((p) => p.productId);
    setSelectedProducts(new Set(allProductIds));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedProducts(new Set());
  };

  // Delete single product
  const handleDeleteProduct = (productId: number, productName: string) => {
    Alert.alert("ยืนยันการลบ", `คุณต้องการลบสินค้า "${productName}" หรือไม่?`, [
      {
        text: "ยกเลิก",
        style: "cancel",
      },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(productId).unwrap();
            Alert.alert("สำเร็จ", "ลบสินค้าเรียบร้อยแล้ว");
            refetchProducts();
          } catch (error: any) {
            console.error("Delete product error:", error);

            let errorMessage = "ไม่สามารถลบสินค้าได้";

            if (error?.status === 403) {
              errorMessage = "คุณไม่มีสิทธิ์ลบสินค้านี้";
            } else if (error?.status === 401) {
              errorMessage = "กรุณาเข้าสู่ระบบใหม่";
            } else if (
              error?.status === 400 &&
              error?.data?.message?.includes("existing orders")
            ) {
              errorMessage = "ไม่สามารถลบสินค้าที่มีคำสั่งซื้อแล้ว";
            } else if (error?.data?.message) {
              errorMessage = error.data.message;
            }

            Alert.alert("เกิดข้อผิดพลาด", errorMessage);
          }
        },
      },
    ]);
  };

  // Delete multiple products
  const handleDeleteMultiple = () => {
    if (selectedProducts.size === 0) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกสินค้าที่ต้องการลบ");
      return;
    }

    Alert.alert(
      "ยืนยันการลบ",
      `คุณต้องการลบสินค้า ${selectedProducts.size} รายการหรือไม่?`,
      [
        {
          text: "ยกเลิก",
          style: "cancel",
        },
        {
          text: "ลบทั้งหมด",
          style: "destructive",
          onPress: async () => {
            let successCount = 0;
            let failCount = 0;
            const errors: string[] = [];

            for (const id of Array.from(selectedProducts)) {
              try {
                await deleteProduct(id).unwrap();
                successCount++;
              } catch (error: any) {
                failCount++;
                if (
                  error?.status === 400 &&
                  error?.data?.message?.includes("existing orders")
                ) {
                  errors.push("บางรายการมีคำสั่งซื้อแล้ว");
                } else if (error?.status === 403) {
                  errors.push("บางรายการไม่มีสิทธิ์ลบ");
                }
              }
            }

            // Clear selection and exit selection mode
            setSelectedProducts(new Set());
            setIsSelectionMode(false);
            refetchProducts();

            if (failCount === 0) {
              Alert.alert(
                "สำเร็จ",
                `ลบสินค้า ${successCount} รายการเรียบร้อยแล้ว`
              );
            } else {
              const uniqueErrors = Array.from(new Set(errors));
              Alert.alert(
                "ลบสำเร็จบางส่วน",
                `ลบสำเร็จ ${successCount} รายการ\nไม่สามารถลบ ${failCount} รายการ\n\n${uniqueErrors.join(
                  "\n"
                )}`
              );
            }
          },
        },
      ]
    );
  };

  if (productsLoading || sellerLoading) {
    return <LoadingState message="กำลังโหลดข้อมูลร้านค้า..." />;
  }

  return (
    <View style={styles.container}>
      {/* Selection Mode Bar */}
      {isSelectionMode && isOwnStore && (
        <View style={styles.selectionBar}>
          <View style={styles.selectionInfo}>
            <TouchableOpacity onPress={toggleSelectionMode}>
              <Icon name="close" size={24} color={colors.surface} />
            </TouchableOpacity>
            <Text style={styles.selectionText}>
              เลือก {selectedProducts.size} รายการ
            </Text>
          </View>
          <View style={styles.selectionActions}>
            {selectedProducts.size < products.length && (
              <TouchableOpacity
                style={styles.selectionActionButton}
                onPress={selectAllProducts}
              >
                <Text style={styles.selectionActionText}>เลือกทั้งหมด</Text>
              </TouchableOpacity>
            )}
            {selectedProducts.size > 0 && (
              <>
                <TouchableOpacity
                  style={styles.selectionActionButton}
                  onPress={clearSelection}
                >
                  <Text style={styles.selectionActionText}>ล้าง</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectionActionButton,
                    styles.deleteActionButton,
                  ]}
                  onPress={handleDeleteMultiple}
                >
                  <Icon name="delete" size={18} color={colors.surface} />
                  <Text style={styles.selectionActionText}>ลบ</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Store Header */}
        <View style={styles.storeHeader}>
          {/* Shop Banner Image */}
          {seller?.shopImageUrl && (
            <Image
              source={{ uri: seller.shopImageUrl }}
              style={styles.shopBannerImage}
              resizeMode="cover"
            />
          )}

          {/* Logo */}
          <View style={styles.storeIconContainer}>
            {seller?.logoUrl ? (
              <Image
                source={{ uri: seller.logoUrl }}
                style={styles.logoImage}
                resizeMode="cover"
              />
            ) : (
              <Icon name="store" size={48} color={colors.primary} />
            )}
          </View>

          <Text style={styles.storeName}>{sellerName}</Text>
          {(sellerDescription || storeLocation?.description) && (
            <Text style={styles.storeDescription}>
              {sellerDescription || storeLocation?.description}
            </Text>
          )}

          {/* Manage Store Button - Only show if user owns this store */}
          {isOwnStore && (
            <View style={{ marginTop: spacing.lg, width: "100%" }}>
              <PrimaryButton
                label="จัดการร้านค้า"
                icon="store-edit"
                onPress={() => navigation.navigate("ManageStore")}
              />
            </View>
          )}
        </View>

        {/* Store Info */}
        {(storeLocation || seller?.address || seller?.phoneNumber) && (
          <View style={styles.storeInfoCard}>
            <Text style={styles.sectionTitle}>ข้อมูลร้านค้า</Text>

            {(storeLocation?.address || seller?.address) && (
              <View style={styles.infoRow}>
                <Icon
                  name="map-marker"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={styles.infoText}>
                  {storeLocation?.address || seller?.address}
                </Text>
              </View>
            )}

            {(storeLocation?.phoneNumber || seller?.phoneNumber) && (
              <View style={styles.infoRow}>
                <Icon name="phone" size={20} color={colors.textSecondary} />
                <Text style={styles.infoText}>
                  {storeLocation?.phoneNumber || seller?.phoneNumber}
                </Text>
              </View>
            )}

            {seller?.userEmail && (
              <View style={styles.infoRow}>
                <Icon name="email" size={20} color={colors.textSecondary} />
                <Text style={styles.infoText}>{seller.userEmail}</Text>
              </View>
            )}

            {storeLocation && (
              <View style={{ marginTop: spacing.sm }}>
                <PrimaryButton
                  label="ดูบนแผนที่"
                  icon="map"
                  onPress={() => {
                    // Navigate to Map tab (nested navigation)
                    const rootNavigation = navigation.getParent()?.getParent();
                    if (rootNavigation) {
                      rootNavigation.navigate("MainTabs", {
                        screen: "Map",
                        params: { highlightLocationId: storeLocation.locationId },
                      });
                    }
                  }}
                />
              </View>
            )}
          </View>
        )}

        {/* Products Section */}
        <View style={styles.productsSection}>
          <View style={styles.productsSectionHeader}>
            <Text style={styles.sectionTitle}>
              สินค้าทั้งหมด ({products.length})
            </Text>
            {isOwnStore && !isSelectionMode && (
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.selectModeButton}
                  onPress={toggleSelectionMode}
                >
                  <Icon
                    name="checkbox-multiple-marked"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <PrimaryButton
                  label="เพิ่มสินค้า"
                  icon="plus"
                  fullWidth={false}
                  style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
                  textStyle={{ fontSize: fontSize.sm }}
                  onPress={() =>
                    navigation.navigate("AddProduct", { sellerId })
                  }
                />
              </View>
            )}
          </View>

          {products.length === 0 ? (
            <View>
              <EmptyState
                icon="package-variant-closed"
                message="ไม่มีสินค้า"
                description="ร้านค้านี้ยังไม่มีสินค้า"
              />
              {isOwnStore && (
                <View style={styles.emptyAddButtonContainer}>
                  <PrimaryButton
                    label="เพิ่มสินค้าแรก"
                    icon="plus-circle"
                    fullWidth={false}
                    onPress={() =>
                      navigation.navigate("AddProduct", { sellerId })
                    }
                  />
                </View>
              )}
            </View>
          ) : (
            <View
              style={
                isSelectionMode
                  ? styles.productsListSelection
                  : styles.productsGrid
              }
            >
              {products.map((product) => (
                <View
                  key={product.productId}
                  style={
                    isSelectionMode
                      ? styles.productListItemWrapper
                      : styles.productCardWrapper
                  }
                >
                  {isSelectionMode ? (
                    <TouchableOpacity
                      style={[
                        styles.selectableCard,
                        selectedProducts.has(product.productId) &&
                          styles.selectedCard,
                      ]}
                      onPress={() => toggleProductSelection(product.productId)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.checkboxContainer}>
                        <Icon
                          name={
                            selectedProducts.has(product.productId)
                              ? "checkbox-marked"
                              : "checkbox-blank-outline"
                          }
                          size={28}
                          color={
                            selectedProducts.has(product.productId)
                              ? colors.primary
                              : colors.textSecondary
                          }
                        />
                      </View>
                      <View style={styles.cardContent}>
                        {product.imageUrl && (
                          <Image
                            source={{ uri: convertImageUrl(product.imageUrl) }}
                            style={styles.selectModeImage}
                            resizeMode="cover"
                          />
                        )}
                        <View style={styles.selectModeInfo}>
                          <Text
                            style={styles.selectModeProductName}
                            numberOfLines={2}
                          >
                            {product.productName}
                          </Text>
                          <Text style={styles.selectModePrice}>
                            ฿{product.price.toFixed(2)}
                          </Text>
                          <Text style={styles.selectModeStock}>
                            คงเหลือ: {product.stock}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <ProductCard
                      id={product.productId}
                      name={product.productName}
                      price={product.price}
                      imageUrl={product.imageUrl}
                      stock={product.stock}
                      sellerName={
                        product.seller?.shopName || product.seller?.ownerName
                      }
                      onPress={() =>
                        navigation.navigate("ProductDetail", {
                          id: product.productId,
                        })
                      }
                      showEditButton={isOwnStore}
                      onEditPress={() =>
                        navigation.navigate("EditProduct", {
                          id: product.productId,
                        })
                      }
                      showDeleteButton={isOwnStore}
                      onDeletePress={() =>
                        handleDeleteProduct(
                          product.productId,
                          product.productName
                        )
                      }
                    />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button - Add Product */}
      <FloatingActionButton
        visible={isOwnStore}
        onPress={() => navigation.navigate("AddProduct", { sellerId })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  storeHeader: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    position: "relative",
  },
  shopBannerImage: {
    width: "120%",
    height: 150,
    marginTop: -spacing.xl,
    marginHorizontal: -spacing.xl,
    marginBottom: spacing.md,
  },
  storeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  storeName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  storeDescription: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  storeInfoCard: {
    backgroundColor: colors.surface,
    margin: spacing.base,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginLeft: spacing.md,
    flex: 1,
  },
  productsSection: {
    padding: spacing.base,
  },
  productsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  emptyAddButtonContainer: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.xs,
  },
  productCardWrapper: {
    width: "50%",
    padding: spacing.xs,
  },
  productsListSelection: {
    flexDirection: "column",
  },
  productListItemWrapper: {
    width: "100%",
    marginBottom: spacing.sm,
  },
  // Selection mode styles
  selectionBar: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  selectionText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.surface,
  },
  selectionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  selectionActionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  deleteActionButton: {
    backgroundColor: colors.error,
  },
  selectionActionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.surface,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  selectModeButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  selectableCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.divider,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: "#E8F5E9",
  },
  checkboxContainer: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: 2,
  },
  cardContent: {
    flexDirection: "row",
    padding: spacing.sm,
  },
  selectModeImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.divider,
  },
  selectModeInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: "center",
  },
  selectModeProductName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  selectModePrice: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  selectModeStock: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});

export default StoreDetailScreen;
