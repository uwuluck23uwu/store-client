import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'medium',
  style,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return { backgroundColor: '#E8F5E9', color: '#4CAF50' };
      case 'danger':
        return { backgroundColor: '#FFEBEE', color: '#F44336' };
      case 'warning':
        return { backgroundColor: '#FFF3E0', color: '#FF9800' };
      case 'info':
        return { backgroundColor: '#E3F2FD', color: '#2196F3' };
      case 'default':
        return { backgroundColor: '#F5F5F5', color: '#666' };
      default:
        return { backgroundColor: '#F5F5F5', color: '#666' };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 };
      case 'medium':
        return { paddingHorizontal: 8, paddingVertical: 4, fontSize: 11 };
      case 'large':
        return { paddingHorizontal: 12, paddingVertical: 6, fontSize: 12 };
      default:
        return { paddingHorizontal: 8, paddingVertical: 4, fontSize: 11 };
    }
  };

  const variantStyle = getVariantStyle();
  const sizeStyle = getSizeStyle();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyle.backgroundColor,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color: variantStyle.color,
            fontSize: sizeStyle.fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '600',
  },
});
