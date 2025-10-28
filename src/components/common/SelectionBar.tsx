import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';

interface SelectionBarProps {
  selectedCount: number;
  totalCount: number;
  onClose: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDelete: () => void;
}

export const SelectionBar: React.FC<SelectionBarProps> = ({
  selectedCount,
  totalCount,
  onClose,
  onSelectAll,
  onClearSelection,
  onDelete,
}) => {
  return (
    <View style={styles.selectionBar}>
      <View style={styles.selectionInfo}>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={24} color={colors.surface} />
        </TouchableOpacity>
        <Text style={styles.selectionText}>
          เลือก {selectedCount} รายการ
        </Text>
      </View>
      <View style={styles.selectionActions}>
        {selectedCount < totalCount && (
          <TouchableOpacity
            style={styles.selectionActionButton}
            onPress={onSelectAll}
          >
            <Text style={styles.selectionActionText}>เลือกทั้งหมด</Text>
          </TouchableOpacity>
        )}
        {selectedCount > 0 && (
          <>
            <TouchableOpacity
              style={styles.selectionActionButton}
              onPress={onClearSelection}
            >
              <Text style={styles.selectionActionText}>ล้าง</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.selectionActionButton, styles.deleteActionButton]}
              onPress={onDelete}
            >
              <Icon name="delete" size={18} color={colors.surface} />
              <Text style={styles.selectionActionText}>ลบ</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  selectionBar: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  selectionText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.surface,
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectionActionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
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
});
