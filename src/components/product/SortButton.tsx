import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius, shadow } from '../../theme';

export type SortOption =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'stock-desc';

interface SortButtonProps {
  selectedSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string; icon: string }[] = [
  { value: 'default', label: 'ค่าเริ่มต้น', icon: 'sort' },
  { value: 'price-asc', label: 'ราคา: ต่ำ - สูง', icon: 'sort-ascending' },
  { value: 'price-desc', label: 'ราคา: สูง - ต่ำ', icon: 'sort-descending' },
  { value: 'name-asc', label: 'ชื่อ: A - Z', icon: 'sort-alphabetical-ascending' },
  { value: 'stock-desc', label: 'สต็อกมากที่สุด', icon: 'sort-numeric-descending' },
];

export const SortButton: React.FC<SortButtonProps> = ({
  selectedSort,
  onSelectSort,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedLabel =
    sortOptions.find((opt) => opt.value === selectedSort)?.label || 'เรียงตาม';

  const handleSelectSort = (sort: SortOption) => {
    onSelectSort(sort);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons
          name="sort-variant"
          size={18}
          color={colors.textSecondary}
        />
        <Text style={styles.sortButtonText}>{selectedLabel}</Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>เรียงลำดับ</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsContainer}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    selectedSort === option.value && styles.optionItemActive,
                  ]}
                  onPress={() => handleSelectSort(option.value)}
                >
                  <View style={styles.optionLeft}>
                    <MaterialCommunityIcons
                      name={option.icon as any}
                      size={22}
                      color={
                        selectedSort === option.value
                          ? colors.primary
                          : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.optionText,
                        selectedSort === option.value && styles.optionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                  {selectedSort === option.value && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={22}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    ...shadow.sm,
  },
  sortButtonText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
    ...shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  optionsContainer: {
    padding: spacing.base,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.base,
    marginBottom: spacing.xs,
  },
  optionItemActive: {
    backgroundColor: colors.primaryLight || 'rgba(76, 175, 80, 0.1)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  optionText: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  optionTextActive: {
    fontWeight: '600',
    color: colors.primary,
  },
});
