import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';

interface StockBadgeProps {
  stock: number;
  size?: 'small' | 'medium';
}

export const StockBadge: React.FC<StockBadgeProps> = ({ stock, size = 'medium' }) => {
  const stockNumber = Number(stock ?? 0);
  const isInStock = stockNumber > 0;
  const isLowStock = stockNumber > 0 && stockNumber <= 5;

  const backgroundColor = isInStock
    ? isLowStock
      ? colors.warningLight
      : colors.successLight
    : colors.errorLight;

  const textColor = isInStock
    ? isLowStock
      ? colors.warning
      : colors.success
    : colors.error;

  const label = isInStock
    ? isLowStock
      ? `สินค้าใกล้หมด (${stockNumber})`
      : `มีสินค้า (${stockNumber})`
    : 'สินค้าหมด';

  return (
    <View style={[styles.container, { backgroundColor }, size === 'small' && styles.smallContainer]}>
      <Text style={[styles.text, { color: textColor }, size === 'small' && styles.smallText]}>
        {String(label)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  smallContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  smallText: {
    fontSize: fontSize.xs,
  },
});
