import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';

interface MenuItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  badge?: string | number;
  iconColor?: string;
  isDestructive?: boolean;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onPress,
  showChevron = true,
  badge,
  iconColor,
  isDestructive = false,
}) => {
  const textColor = isDestructive ? colors.error : colors.textPrimary;
  const finalIconColor = iconColor || (isDestructive ? colors.error : colors.primary);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={finalIconColor}
        />
      </View>

      <Text style={[styles.label, { color: textColor }]}>{label}</Text>

      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      {showChevron && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colors.textTertiary}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  iconContainer: {
    marginRight: spacing.base,
  },
  label: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
