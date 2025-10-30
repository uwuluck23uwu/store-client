import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { colors, spacing } from "../../theme";

export type OrderStatus = "Pending" | "Confirmed" | "Delivered" | "Cancelled";

type IconName = React.ComponentProps<typeof Icon>["name"];

interface StatusOption {
  value: OrderStatus;
  label: string;
  icon: IconName;
  color: string;
  description: string;
}

interface StatusUpdateModalProps {
  visible: boolean;
  currentStatus: string;
  orderNumber: string;
  onClose: () => void;
  onUpdate: (newStatus: OrderStatus) => Promise<void>;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  visible,
  currentStatus,
  orderNumber,
  onClose,
  onUpdate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions: StatusOption[] = [
    {
      value: "Pending",
      label: "รอดำเนินการ",
      icon: "clock-outline",
      color: colors.warning,
      description: "คำสั่งซื้อรอการยืนยัน",
    },
    {
      value: "Confirmed",
      label: "ยืนยันแล้ว",
      icon: "check-circle-outline",
      color: colors.info,
      description: "คำสั่งซื้อได้รับการยืนยัน",
    },
    {
      value: "Delivered",
      label: "สำเร็จ",
      icon: "package-variant-closed",
      color: colors.success,
      description: "ลูกค้าได้รับสินค้าแล้ว",
    },
    {
      value: "Cancelled",
      label: "ยกเลิก",
      icon: "close-circle-outline",
      color: colors.error,
      description: "คำสั่งซื้อถูกยกเลิก",
    },
  ];

  const handleUpdate = async () => {
    if (!selectedStatus || selectedStatus === currentStatus) {
      onClose();
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(selectedStatus);
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      setSelectedStatus(null);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Icon name="swap-vertical" size={24} color={colors.primary} />
                  <View style={styles.headerText}>
                    <Text style={styles.title}>อัพเดทสถานะคำสั่งซื้อ</Text>
                    <Text style={styles.orderNumber}>{orderNumber}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                  disabled={isUpdating}
                >
                  <Icon name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Status Options */}
              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.sectionLabel}>เลือกสถานะใหม่:</Text>

                {statusOptions.map((option) => {
                  const isSelected = selectedStatus === option.value;
                  const isCurrent = currentStatus === option.value;

                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.statusOption,
                        isSelected && styles.statusOptionSelected,
                        isCurrent && styles.statusOptionCurrent,
                      ]}
                      onPress={() => setSelectedStatus(option.value)}
                      disabled={isUpdating || isCurrent}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.statusIconContainer,
                          {
                            backgroundColor: option.color + "20",
                          },
                        ]}
                      >
                        <Icon
                          name={option.icon}
                          size={24}
                          color={option.color}
                        />
                      </View>

                      <View style={styles.statusInfo}>
                        <Text
                          style={[styles.statusLabel, { color: option.color }]}
                        >
                          {option.label}
                        </Text>
                        <Text style={styles.statusDescription}>
                          {option.description}
                        </Text>
                      </View>

                      {isCurrent && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>
                            สถานะปัจจุบัน
                          </Text>
                        </View>
                      )}

                      {isSelected && !isCurrent && (
                        <Icon
                          name="check-circle"
                          size={24}
                          color={colors.success}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Footer Actions */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                  disabled={isUpdating}
                >
                  <Text style={styles.cancelButtonText}>ยกเลิก</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.updateButton,
                    (!selectedStatus ||
                      selectedStatus === currentStatus ||
                      isUpdating) &&
                      styles.updateButtonDisabled,
                  ]}
                  onPress={handleUpdate}
                  disabled={
                    !selectedStatus ||
                    selectedStatus === currentStatus ||
                    isUpdating
                  }
                >
                  {isUpdating ? (
                    <ActivityIndicator color={colors.surface} size="small" />
                  ) : (
                    <Text style={styles.updateButtonText}>
                      ยืนยันการเปลี่ยนแปลง
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.primaryLight + "20",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  statusOptionSelected: {
    borderColor: colors.success,
    backgroundColor: colors.success + "10",
  },
  statusOptionCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + "20",
    opacity: 0.7,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  currentBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 11,
    color: colors.surface,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  updateButton: {
    flex: 2,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  updateButtonDisabled: {
    backgroundColor: colors.border,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.surface,
  },
});

export default StatusUpdateModal;
