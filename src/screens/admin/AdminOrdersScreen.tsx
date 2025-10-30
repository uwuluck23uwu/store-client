import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from "../../api/orderApi";
import {
  LoadingState,
  EmptyState,
  SearchBar,
  FilterChips,
  StatusUpdateModal,
} from "../../components/common";
import type { FilterOption, OrderStatus } from "../../components/common";
import { colors, spacing } from "../../theme";
import type { OrderDetail } from "../../types/api.types";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const AdminOrdersScreen = ({ navigation }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

  const { data, isLoading, refetch } = useGetAllOrdersQuery();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const orders: OrderDetail[] = data?.data || [];

  // Status options
  const statusOptions: FilterOption[] = [
    { label: "ทั้งหมด", value: "all" },
    { label: "รอดำเนินการ", value: "Pending" },
    { label: "ยืนยันแล้ว", value: "Confirmed" },
    { label: "สำเร็จ", value: "Delivered" },
    { label: "ยกเลิก", value: "Cancelled" },
  ];

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order: OrderDetail) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" || order.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, selectedStatus]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      Pending: colors.warning,
      Confirmed: colors.info,
      Shipped: colors.primary,
      Delivered: colors.success,
      Cancelled: colors.error,
    };
    return statusColors[status] || colors.textSecondary;
  };

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      Pending: "รอดำเนินการ",
      Confirmed: "ยืนยันแล้ว",
      Delivered: "สำเร็จ",
      Cancelled: "ยกเลิก",
    };
    return statusTexts[status] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      Paid: colors.success,
      Pending: colors.warning,
      Refunded: colors.error,
    };
    return statusColors[status] || colors.textSecondary;
  };

  const getPaymentStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      Paid: "ชำระแล้ว",
      Pending: "รอชำระ",
      Refunded: "คืนเงินแล้ว",
    };
    return statusTexts[status] || status;
  };

  // Resolve product name from various possible API shapes
  const getOrderItemName = (orderItem: any) => {
    return (
      orderItem?.productName ||
      orderItem?.product?.productName ||
      orderItem?.name ||
      orderItem?.product?.name ||
      "-"
    );
  };

  // Decide payment badge display from order + payment status
  const getPaymentDisplay = (order: OrderDetail) => {
    if (order.status === "Cancelled") {
      return {
        icon: "close-circle",
        color: colors.error,
        text: "ยกเลิก",
      };
    }

    if (order.status === "Delivered" || order.payment?.status === "Paid") {
      return {
        icon: "check-circle",
        color: colors.success,
        text: "ชำระแล้ว",
      };
    }

    // Default for Pending/Confirmed/Shipped and anything else
    return {
      icon: "clock-outline",
      color: colors.warning,
      text: "รอชำระ",
    };
  };

  const formatCurrency = (amount: number) => {
    return `฿${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy HH:mm", { locale: th });
  };

  const handleOrderPress = (order: OrderDetail) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder?.orderId) {
      Alert.alert("ข้อผิดพลาด", "ไม่พบข้อมูลคำสั่งซื้อ");
      return;
    }

    try {
      await updateOrderStatus({
        orderId: selectedOrder.orderId,
        data: { status: newStatus },
      }).unwrap();

      Alert.alert("สำเร็จ", "อัพเดทสถานะคำสั่งซื้อเรียบร้อยแล้ว");
      refetch();
    } catch (error: any) {
      Alert.alert(
        "เกิดข้อผิดพลาด",
        error?.data?.message || "ไม่สามารถอัพเดทสถานะได้"
      );
      throw error;
    }
  };

  const renderOrderCard = ({ item: order }: { item: OrderDetail }) => {
    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.7}
        onPress={() => handleOrderPress(order)}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderNumber}>
              {order.orderNumber || `#${order.orderId}`}
            </Text>
            <Text style={styles.orderDate}>
              {formatDate(order.orderDate || order.createdAt || "")}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(order.status) + "20" },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(order.status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(order.status) },
              ]}
            >
              {getStatusText(order.status)}
            </Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.customerSection}>
          <Icon name="account" size={18} color={colors.primary} />
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>
              {order.userName || "ไม่ระบุชื่อ"}
            </Text>
            <Text style={styles.customerDetail}>{order.userEmail}</Text>
            {order.userPhone && (
              <Text style={styles.customerDetail}>
                <Icon name="phone" size={12} color={colors.textSecondary} />{" "}
                {order.userPhone}
              </Text>
            )}
          </View>
        </View>

        {/* Order Items */}
        {order.orderItems && order.orderItems.length > 0 && (
          <View style={styles.itemsSection}>
            <Text style={styles.itemsLabel}>
              สินค้า ({order.orderItems.length} รายการ):
            </Text>
            {order.orderItems.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>• {getOrderItemName(item)}</Text>
                <View style={styles.itemRight}>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    {formatCurrency(item.totalPrice || 0)}
                  </Text>
                </View>
              </View>
            ))}
            {order.orderItems.length > 3 && (
              <Text style={styles.moreItems}>
                + อีก {order.orderItems.length - 3} รายการ
              </Text>
            )}
          </View>
        )}

        {/* Payment & Total */}
        <View style={styles.orderFooter}>
          <View style={styles.paymentInfo}>
            {(() => {
              const display = getPaymentDisplay(order);
              return (
                <>
                  <Icon
                    name={display.icon as any}
                    size={16}
                    color={display.color}
                  />
                  <Text
                    style={[styles.paymentStatus, { color: display.color }]}
                  >
                    {display.text}
                  </Text>
                </>
              );
            })()}
          </View>
          <Text style={styles.totalAmount}>
            รวม {formatCurrency(order.totalAmount || 0)}
          </Text>
        </View>

        {/* Note */}
        {order.note && (
          <View style={styles.noteSection}>
            <Icon name="note-text" size={14} color={colors.textSecondary} />
            <Text style={styles.noteText} numberOfLines={2}>
              {order.note}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading && !refreshing) {
    return <LoadingState />;
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScrollContent}
        >
          <View style={styles.statCard}>
            <Icon name="package-variant" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>ทั้งหมด</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="clock-outline" size={24} color={colors.warning} />
            <Text style={[styles.statValue, { color: colors.warning }]}>
              {orders.filter((o) => o.status === "Pending").length}
            </Text>
            <Text style={styles.statLabel}>รอดำเนินการ</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="check-circle-outline" size={24} color={colors.info} />
            <Text style={[styles.statValue, { color: colors.info }]}>
              {orders.filter((o) => o.status === "Confirmed").length}
            </Text>
            <Text style={styles.statLabel}>ยืนยันแล้ว</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="check-circle" size={24} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.success }]}>
              {orders.filter((o) => o.status === "Delivered").length}
            </Text>
            <Text style={styles.statLabel}>สำเร็จ</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="close-circle" size={24} color={colors.error} />
            <Text style={[styles.statValue, { color: colors.error }]}>
              {orders.filter((o) => o.status === "Cancelled").length}
            </Text>
            <Text style={styles.statLabel}>ยกเลิก</Text>
          </View>
        </ScrollView>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="ค้นหาเลขคำสั่งซื้อ, ชื่อลูกค้า, อีเมล..."
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FilterChips
          title=""
          options={statusOptions}
          selectedValue={selectedStatus}
          onSelect={setSelectedStatus}
        />
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon="package-variant"
          message={
            searchQuery || selectedStatus !== "all"
              ? "ไม่พบคำสั่งซื้อที่ตรงกับการค้นหา"
              : "ยังไม่มีคำสั่งซื้อในระบบ"
          }
        />
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderCard}
          keyExtractor={(item) =>
            item.orderId?.toString() || Math.random().toString()
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Status Update Modal */}
      {selectedOrder && (
        <StatusUpdateModal
          visible={modalVisible}
          currentStatus={selectedOrder.status}
          orderNumber={selectedOrder.orderNumber || `#${selectedOrder.orderId}`}
          onClose={handleCloseModal}
          onUpdate={handleUpdateStatus}
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
  statsContainer: {
    paddingVertical: spacing.md,
  },
  statsScrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    minWidth: 130,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
  },
  filtersContainer: {
    maxHeight: 60,
    marginBottom: spacing.lg,
  },
  filtersContent: {
    paddingHorizontal: spacing.md,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: spacing.xs,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderHeaderLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  customerSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primaryLight + "30",
    borderRadius: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  customerDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  itemsSection: {
    marginBottom: spacing.sm,
  },
  itemsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    gap: spacing.xs,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  itemQuantity: {
    fontSize: 13,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 35,
    textAlign: "center",
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    minWidth: 70,
    textAlign: "right",
  },
  moreItems: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginTop: 4,
    textAlign: "center",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  paymentStatus: {
    fontSize: 13,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  noteSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.warningLight + "40",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default AdminOrdersScreen;
