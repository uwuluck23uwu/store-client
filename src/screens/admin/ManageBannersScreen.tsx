import React, { useState } from "react";
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
  useGetAllBannersQuery,
  useDeleteBannerMutation,
  useToggleBannerStatusMutation,
  AppBanner,
} from "../../api/bannerApi";
import { convertImageUrl } from "../../api/baseApi";
import {
  LoadingState,
  EmptyState,
  FloatingActionButton,
} from "../../components/common";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from "../../theme";

const ManageBannersScreen = ({ navigation }: any) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: bannersData, isLoading, refetch } = useGetAllBannersQuery();
  const banners = bannersData?.data || [];

  const [deleteBanner] = useDeleteBannerMutation();
  const [toggleBannerStatus] = useToggleBannerStatusMutation();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const openCreateScreen = () => {
    navigation.navigate("CreateBanner");
  };

  const openEditScreen = (banner: AppBanner) => {
    navigation.navigate("EditBanner", { bannerId: banner.appBannerId });
  };

  const handleToggleStatus = (banner: AppBanner) => {
    const action = banner.isActive ? "ปิดการใช้งาน" : "เปิดการใช้งาน";
    Alert.alert(
      `ยืนยันการ${action}`,
      `คุณต้องการ${action}แบนเนอร์นี้ใช่หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: action,
          style: banner.isActive ? "destructive" : "default",
          onPress: async () => {
            try {
              await toggleBannerStatus(banner.appBannerId).unwrap();
              await refetch();
              Alert.alert("สำเร็จ", `${action}แบนเนอร์เรียบร้อยแล้ว`);
            } catch (error: any) {
              console.error("Toggle status error:", error);
              Alert.alert(
                "เกิดข้อผิดพลาด",
                error?.data?.message || `ไม่สามารถ${action}แบนเนอร์ได้`
              );
            }
          },
        },
      ]
    );
  };

  const handleDelete = (banner: AppBanner) => {
    Alert.alert("ยืนยันการลบ", "คุณต้องการลบแบนเนอร์นี้ใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteBanner(banner.appBannerId).unwrap();
            await refetch();
            Alert.alert("สำเร็จ", "ลบแบนเนอร์เรียบร้อยแล้ว");
          } catch (error: any) {
            console.error("Delete error:", error);
            Alert.alert(
              "เกิดข้อผิดพลาด",
              error?.data?.message || "ไม่สามารถลบแบนเนอร์ได้"
            );
          }
        },
      },
    ]);
  };

  const renderBanner = ({ item }: { item: AppBanner }) => {
    return (
      <TouchableOpacity
        style={styles.bannerCard}
        onPress={() => openEditScreen(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: convertImageUrl(item.imageUrl) }}
          style={styles.bannerImage}
          resizeMode="cover"
        />

        <View style={styles.bannerInfo}>
          <View style={styles.bannerHeader}>
            <View style={styles.titleContainer}>
              {item.title && (
                <Text style={styles.bannerTitle} numberOfLines={1}>
                  {item.title}
                </Text>
              )}
              <View style={styles.metaRow}>
                <Text style={styles.orderText}>ลำดับ: {item.displayOrder}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: item.isActive
                        ? colors.successLight
                        : colors.errorLight,
                    },
                  ]}
                >
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
            </View>
          </View>

          <View style={styles.bannerActions}>
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
              <Icon
                name={item.isActive ? "eye-off" : "eye"}
                size={20}
                color={item.isActive ? colors.warning : colors.success}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(item)}
            >
              <Icon name="delete" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingState message="กำลังโหลดแบนเนอร์..." />;
  }

  return (
    <View style={styles.container}>
      {/* Banners Count */}
      <View style={styles.countContainer}>
        <View style={styles.countBadge}>
          <View style={styles.countDot} />
          <Text style={styles.countText}>
            แบนเนอร์ทั้งหมด {banners.length} รายการ
          </Text>
        </View>
      </View>

      <FlatList
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.appBannerId.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="image-off"
            message="ยังไม่มีแบนเนอร์"
            description="เริ่มต้นโดยการเพิ่มแบนเนอร์หลักของแอป"
          />
        }
      />

      <FloatingActionButton onPress={openCreateScreen} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  countContainer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
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
    paddingBottom: 80,
  },
  bannerCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.base,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerImage: {
    width: "100%",
    height: 180,
    backgroundColor: colors.divider,
  },
  bannerInfo: {
    flexDirection: "row",
    padding: spacing.sm,
  },
  bannerHeader: {
    flex: 1,
  },
  titleContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  orderText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bannerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: spacing.sm,
    marginLeft: 4,
  },
});

export default ManageBannersScreen;
