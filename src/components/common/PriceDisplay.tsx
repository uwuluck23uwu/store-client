import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors, fontSize, fontWeight } from '../../theme';

interface PriceDisplayProps {
  price: number;
  size?: 'small' | 'medium' | 'large';
  style?: TextStyle;
  currency?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  size = 'medium',
  style,
  currency = '฿',
}) => {
  const priceNumber = Number(price ?? 0);
  const formattedPrice = priceNumber.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const sizeStyle = size === 'large' ? styles.large : size === 'small' ? styles.small : styles.medium;

  return (
    <Text style={[styles.price, sizeStyle, style]}>
      {String(currency)}{String(formattedPrice)}
    </Text>
  );
};

const styles = StyleSheet.create({
  price: {
    color: colors.price,
    fontWeight: fontWeight.bold,
  },
  small: {
    fontSize: fontSize.sm,
  },
  medium: {
    fontSize: fontSize.lg,
  },
  large: {
    fontSize: fontSize.xxl,
  },
});
