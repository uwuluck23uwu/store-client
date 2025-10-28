import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

interface SummaryRowProps {
  label: string;
  value: string | number;
  isTotal?: boolean;
  isHighlighted?: boolean;
}

export const SummaryRow: React.FC<SummaryRowProps> = ({
  label,
  value,
  isTotal = false,
  isHighlighted = false,
}) => {
  return (
    <View style={[styles.container, isTotal && styles.totalContainer]}>
      <Text style={[styles.label, isTotal && styles.totalLabel]}>{label}</Text>
      <Text
        style={[
          styles.value,
          isTotal && styles.totalValue,
          isHighlighted && styles.highlightedValue,
        ]}
      >
        {typeof value === 'number' ? `฿${value.toLocaleString('th-TH', { minimumFractionDigits: 2 })}` : value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.base,
  },
  label: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  totalLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  value: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  highlightedValue: {
    color: colors.primary,
  },
});
