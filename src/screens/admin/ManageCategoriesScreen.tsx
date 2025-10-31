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
  useGetCategoriesQuery,
  useToggleCategoryStatusMutation,
} from "../../api/productApi";
import { convertImageUrl } from "../../api/baseApi";
import { Category } from "../../types/api.types";
import {
  LoadingState,
  EmptyState,
  FloatingActionButton,
  SearchBar,
  FilterChips,
  SelectionBar,
} from "../../components/common";
import type { FilterOption } from "../../components/common";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from "../../theme";

const ManageCategoriesScreen = ({ navigation }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Multi-select states
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
    new Set()
  );

  const { data: categoriesData, isLoading, refetch } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  const [toggleCategoryStatus] = useToggleCategoryStatusMutation();

  // Status options
  const statusOptions: FilterOption[] = [
    { label: "ทั้งหมด", value: "all" },
    { label: "เปิดใช้งาน", value: "active" },
    { label: "ปิดใช้งาน", value: "inactive" },
  ];

  // Filter categories based on search and filters
  const filteredCategories = useMemo(() => {
    return categories.filter((category: Category) => {
      // Search filter
      const matchesSearch =
        searchQuery.trim() === "" ||
        category.categoryName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (category.description &&
          category.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      // Status filter
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && category.isActive) ||
        (selectedStatus === "inactive" && !category.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, selectedStatus]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedCategories(new Set());
  };

  // Toggle category selection
  const toggleCategorySelection = (categoryId: number) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  // Select all categories
  const selectAll = () => {
    const allIds = new Set(
      filteredCategories.map((c: Category) => c.categoryId)
    );
    setSelectedCategories(allIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedCategories(new Set());
  };

  const openCreateScreen = () => {
    navigation.navigate("CreateCategory");
  };

  const openEditScreen = (category: Category) => {
    navigation.navigate("EditCategory", { categoryId: category.categoryId });
  };

  const handleToggleStatus = (category: Category) => {
    const action = category.isActive ? "ปิดการใช้งาน" : "เปิดการใช้งาน";
    Alert.alert(
      `ยืนยันการ${action}`,
      `คุณต้องการ${action}หมวดหมู่ "${category.categoryName}" ใช่หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: action,
          style: category.isActive ? "destructive" : "default",
          onPress: async () => {
            try {
              const result = await toggleCategoryStatus(
                category.categoryId
              ).unwrap();

              // Refetch to update the list
              await refetch();

              // Show appropriate success message
              if (result.message?.includes("deleted")) {
                Alert.alert("สำเร็จ", "ลบหมวดหมู่เรียบร้อยแล้ว");
              } else {
                Alert.alert("สำเร็จ", `${action}หมวดหมู่เรียบร้อยแล้ว`);
              }
            } catch (error: any) {
              console.error("Toggle status error:", error);

              let errorMessage = `ไม่สามารถ${action}หมวดหมู่ได้`;

              if (
                error?.status === 400 &&
                error?.data?.message?.includes("associated products")
              ) {
                errorMessage =
                  "ไม่สามารถปิดการใช้งานได้ เนื่องจากมีสินค้าที่เชื่อมโยงอยู่";
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

  // Toggle multiple categories
  const handleToggleMultiple = () => {
    if (selectedCategories.size === 0) {
      Alert.alert("กรุณาเลือกหมวดหมู่", "กรุณาเลือกหมวดหมู่ที่ต้องการลบ");
      return;
    }

    Alert.alert(
      "ยืนยันการลบ",
      `คุณต้องการลบหมวดหมู่ ${selectedCategories.size} รายการ ใช่หรือไม่?\n\nหมวดหมู่ที่มีสินค้าจะถูกปิดการใช้งาน ส่วนที่ไม่มีสินค้าจะถูกลบถาวร`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ดำเนินการ",
          style: "destructive",
          onPress: async () => {
            try {
              let successCount = 0;
              let failCount = 0;
              const errors: string[] = [];

              for (const id of Array.from(selectedCategories)) {
                try {
                  await toggleCategoryStatus(id).unwrap();
                  successCount++;
                } catch (error: any) {
                  failCount++;
                  if (
                    error?.status === 400 &&
                    error?.data?.message?.includes("associated products")
                  ) {
                    errors.push("บางรายการมีสินค้าที่เชื่อมโยงอยู่");
                  }
                }
              }

              setSelectedCategories(new Set());
              setIsSelectionMode(false);

              // Refetch to update the list
              await refetch();

              if (failCount === 0) {
                Alert.alert(
                  "สำเร็จ",
                  `ดำเนินการกับหมวดหมู่ ${successCount} รายการเรียบร้อยแล้ว`
                );
              } else {
                Alert.alert(
                  "สำเร็จบางส่วน",
                  `ดำเนินการสำเร็จ ${successCount} รายการ\nไม่สามารถดำเนินการ ${failCount} รายการ\n\n${
                    errors[0] || "ไม่สามารถดำเนินการบางรายการได้"
                  }`
                );
              }
            } catch (error: any) {
              Alert.alert(
                "เกิดข้อผิดพลาด",
                error?.data?.message || "ไม่สามารถดำเนินการได้"
              );
            }
          },
        },
      ]
    );
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const isSelected = selectedCategories.has(item.categoryId);

    return (
      <TouchableOpacity
        style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
        onLongPress={() => {
          setIsSelectionMode(true);
          toggleCategorySelection(item.categoryId);
        }}
        onPress={() => {
          if (isSelectionMode) {
            toggleCategorySelection(item.categoryId);
          }
        }}
        activeOpacity={0.7}
      >
        {isSelectionMode && (
          <View style={styles.checkboxContainer}>
            <View
              style={[styles.checkbox, isSelected && styles.checkboxSelected]}
            >
              {isSelected && <Icon name="check" size={20} color="#fff" />}
            </View>
          </View>
        )}

        {item.imageUrl ? (
          <Image
            source={{ uri: convertImageUrl(item.imageUrl) }}
            style={styles.categoryImage}
          />
        ) : (
          <View style={[styles.categoryImage, styles.noImage]}>
            <Icon name="image-off" size={32} color={colors.textTertiary} />
          </View>
        )}

        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.categoryName}</Text>
          {item.description && (
            <Text style={styles.categoryDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View style={styles.statusBadge}>
            <Text
              style={[
                styles.statusText,
                { color: item.isActive ? colors.success : colors.error },
              ]}
            >
              {item.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
            </Text>
          </View>
        </View>

        {!isSelectionMode && (
          <View style={styles.categoryActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditScreen(item)}
            >
              <Icon name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleToggleStatus(item)}
            >
              <Icon name="delete" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingState message="กำลังโหลดหมวดหมู่..." />;
  }

  return (
    <View style={styles.container}>
      {/* Selection Mode Bar */}
      {isSelectionMode && (
        <SelectionBar
          selectedCount={selectedCategories.size}
          totalCount={filteredCategories.length}
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
            placeholder="ค้นหาหมวดหมู่..."
          />
        </View>
      )}

      {/* Filter Chips */}
      {!isSelectionMode && (
        <View style={styles.filtersContainer}>
          <FilterChips
            title="สถานะ:"
            options={statusOptions}
            selectedValue={selectedStatus}
            onSelect={setSelectedStatus}
          />
        </View>
      )}

      {/* Categories Count */}
      <View style={styles.countContainer}>
        <View style={styles.countBadge}>
          <View style={styles.countDot} />
          <Text style={styles.countText}>
            แสดง {filteredCategories.length} จาก {categories.length} รายการ
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.categoryId.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="folder-open"
            message={
              searchQuery || selectedStatus !== "all"
                ? "ไม่พบหมวดหมู่ที่ค้นหา"
                : "ยังไม่มีหมวดหมู่"
            }
            description={
              searchQuery || selectedStatus !== "all"
                ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง"
                : "เริ่มต้นโดยการเพิ่มหมวดหมู่สินค้าใหม่"
            }
          />
        }
      />

      {!isSelectionMode && <FloatingActionButton onPress={openCreateScreen} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  listContent: {
    padding: spacing.base,
    paddingTop: 0,
    paddingBottom: 80,
  },
  categoryCard: {
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
  categoryCardSelected: {
    backgroundColor: "#e8f5e9",
    borderColor: colors.primary,
    borderWidth: 2,
  },
  checkboxContainer: {
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.divider,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.divider,
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  categoryInfo: {
    flex: 1,
    marginLeft: spacing.base,
    justifyContent: "center",
  },
  categoryName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  categoryDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  categoryActions: {
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    padding: spacing.sm,
    marginVertical: 4,
  },
});

export default ManageCategoriesScreen;
