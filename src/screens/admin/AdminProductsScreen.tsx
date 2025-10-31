import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import {
  useGetProductsQuery,
  useToggleProductStatusMutation,
} from "../../api/productApi";
import {
  LoadingState,
  EmptyState,
  FloatingActionButton,
  SearchBar,
  FilterChips,
  SelectionBar,
} from "../../components/common";
import type { FilterOption } from "../../components/common";
import { ProductSelectionCard } from "../../components/product";
import { colors, spacing } from "../../theme";

const AdminProductsScreen = ({ navigation }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Multi-select states
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(
    new Set()
  );

  // Map selectedStatus to isActive parameter using useMemo to ensure proper dependency tracking
  const queryParams = useMemo(() => {
    const isActiveParam = selectedStatus === "active" ? true
      : selectedStatus === "inactive" ? false
      : undefined;

    return {
      pageSize: 1000,
      isActive: isActiveParam,
    };
  }, [selectedStatus]);

  const { data, isLoading, refetch } = useGetProductsQuery(queryParams);
  const [toggleProductStatus] = useToggleProductStatusMutation();

  const products = data?.data || [];

  // Extract unique categories as FilterOptions
  const categoryOptions: FilterOption[] = useMemo(() => {
    const uniqueCategories = [
      ...new Set(products.map((p: any) => p.categoryName)),
    ];
    return [
      { label: "ทั้งหมด", value: "all" },
      ...uniqueCategories.map((cat: string) => ({ label: cat, value: cat })),
    ];
  }, [products]);

  // Status options
  const statusOptions: FilterOption[] = [
    { label: "ทั้งหมด", value: "all" },
    { label: "เปิดใช้งาน", value: "active" },
    { label: "ปิดใช้งาน", value: "inactive" },
  ];

  // Filter products based on search and filters (client-side only for search and category)
  // Status filter is now handled by API
  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      // Search filter
      const matchesSearch =
        searchQuery.trim() === "" ||
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === "all" || product.categoryName === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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
  const selectAll = () => {
    const allIds = new Set(filteredProducts.map((p: any) => p.productId));
    setSelectedProducts(allIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedProducts(new Set());
  };

  // Toggle product status (soft delete)
  const handleToggleStatus = (
    productId: number,
    productName: string,
    isActive: boolean
  ) => {
    const action = isActive ? "ปิดการใช้งาน" : "เปิดการใช้งาน";
    Alert.alert(
      `ยืนยันการ${action}`,
      `คุณต้องการ${action}สินค้า "${productName}" ใช่หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: action,
          style: isActive ? "destructive" : "default",
          onPress: async () => {
            try {
              await toggleProductStatus(productId).unwrap();
              Alert.alert("สำเร็จ", `${action}สินค้าเรียบร้อยแล้ว`);
            } catch (error: any) {
              console.error("Toggle status error:", error);

              let errorMessage = `ไม่สามารถ${action}สินค้าได้`;

              if (error?.status === 403) {
                errorMessage = "คุณไม่มีสิทธิ์แก้ไขสินค้านี้ (สินค้าของร้านอื่น)";
              } else if (error?.status === 401) {
                errorMessage = "กรุณาเข้าสู่ระบบใหม่";
              } else if (error?.data?.message) {
                errorMessage = error.data.message;
              }

              Alert.alert("เกิดข้อผิดพลาด", errorMessage);
            }
          },
        },
      ]
    );
  };

  // Toggle multiple products (soft delete)
  const handleToggleMultiple = () => {
    if (selectedProducts.size === 0) {
      Alert.alert("กรุณาเลือกสินค้า", "กรุณาเลือกสินค้าที่ต้องการปิดการใช้งาน");
      return;
    }

    Alert.alert(
      "ยืนยันการปิดการใช้งาน",
      `คุณต้องการปิดการใช้งานสินค้า ${selectedProducts.size} รายการ ใช่หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ปิดการใช้งานทั้งหมด",
          style: "destructive",
          onPress: async () => {
            try {
              let successCount = 0;
              let failCount = 0;
              const errors: string[] = [];

              // Toggle ทีละรายการเพื่อตรวจสอบ error แต่ละรายการ
              for (const id of Array.from(selectedProducts)) {
                try {
                  await toggleProductStatus(id).unwrap();
                  successCount++;
                } catch (error: any) {
                  failCount++;
                  if (error?.status === 403) {
                    errors.push("บางรายการเป็นสินค้าของร้านอื่น");
                  }
                }
              }

              setSelectedProducts(new Set());
              setIsSelectionMode(false);

              if (failCount === 0) {
                Alert.alert(
                  "สำเร็จ",
                  `ปิดการใช้งานสินค้า ${successCount} รายการเรียบร้อยแล้ว`
                );
              } else {
                Alert.alert(
                  "สำเร็จบางส่วน",
                  `ปิดการใช้งานสำเร็จ ${successCount} รายการ\nไม่สามารถปิดการใช้งาน ${failCount} รายการ\n\n${
                    errors[0] || "ไม่มีสิทธิ์แก้ไขบางรายการ"
                  }`
                );
              }
            } catch (error: any) {
              Alert.alert(
                "เกิดข้อผิดพลาด",
                error?.data?.message || "ไม่สามารถปิดการใช้งานสินค้าได้"
              );
            }
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }: any) => {
    const isSelected = selectedProducts.has(item.productId);

    // Selection mode - use ProductSelectionCard
    if (isSelectionMode) {
      return (
        <ProductSelectionCard
          id={item.productId}
          name={item.productName}
          price={item.price}
          imageUrl={item.imageUrl}
          stock={item.stock}
          isSelected={isSelected}
          onToggleSelect={toggleProductSelection}
        />
      );
    }

    // Normal mode - existing card with edit/delete buttons
    return (
      <TouchableOpacity
        style={styles.productCard}
        onLongPress={() => {
          setIsSelectionMode(true);
          toggleProductSelection(item.productId);
        }}
        activeOpacity={0.7}
      >
        <Image
          source={
            item.imageUrl
              ? { uri: item.imageUrl }
              : require("../../../assets/icon.png")
          }
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.productName}
          </Text>
          <Text style={styles.productPrice}>฿{item.price.toFixed(2)}</Text>
          <Text style={styles.productStock}>
            คลัง: {item.stock} {item.unit}
          </Text>
          <Text style={styles.productCategory}>{item.categoryName}</Text>
          <View style={styles.statusBadge}>
            <Text
              style={[
                styles.statusText,
                { color: item.isActive ? "#4CAF50" : "#f44336" },
              ]}
            >
              {item.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("EditProduct", { productId: item.productId })
            }
          >
            <Icon name="pencil" size={24} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              handleToggleStatus(
                item.productId,
                item.productName,
                item.isActive
              )
            }
          >
            <Icon
              name="delete"
              size={24}
              color="#f44336"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <View style={styles.container}>
      {/* Selection Mode Bar */}
      {isSelectionMode && (
        <SelectionBar
          selectedCount={selectedProducts.size}
          totalCount={filteredProducts.length}
          onClose={toggleSelectionMode}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onDelete={handleToggleMultiple}
        />
      )}

      {/* Search Bar */}
      {!isSelectionMode && (
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ค้นหาสินค้า..."
          />
        </View>
      )}

      {/* Filter Chips - hidden in selection mode */}
      {!isSelectionMode && (
        <View style={styles.filtersContainer}>
          <FilterChips
            title="หมวดหมู่:"
            options={categoryOptions}
            selectedValue={selectedCategory}
            onSelect={setSelectedCategory}
          />

          <FilterChips
            title="สถานะ:"
            options={statusOptions}
            selectedValue={selectedStatus}
            onSelect={setSelectedStatus}
          />
        </View>
      )}

      {/* Products Count */}
      <View style={styles.countContainer}>
        <View style={styles.countBadge}>
          <View style={styles.countDot} />
          <Text style={styles.countText}>
            แสดง {filteredProducts.length} จาก {products.length} รายการ
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.productId.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            message={
              searchQuery ||
              selectedCategory !== "all" ||
              selectedStatus !== "all"
                ? "ไม่พบสินค้าที่ค้นหา"
                : "ยังไม่มีสินค้าในระบบ"
            }
            icon="package-variant"
          />
        }
      />
      {!isSelectionMode && (
        <FloatingActionButton
          onPress={() => navigation.navigate("CreateProduct")}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  selectionBar: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  closeButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  selectionText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  selectionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  selectAllButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selectAllText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "500",
  },
  clearButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  clearText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "500",
  },
  deleteMultipleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    gap: spacing.xs,
  },
  deleteMultipleText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  filtersContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
  },
  countContainer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  countDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  countText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  listContainer: {
    padding: spacing.base,
    paddingTop: 0,
    paddingBottom: 80,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  productInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.success,
    marginBottom: 4,
  },
  productStock: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
    marginVertical: 4,
  },
});

export default AdminProductsScreen;
