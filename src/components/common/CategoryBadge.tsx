import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';

interface CategoryBadgeProps {
  category: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, icon }) => {
  if (!category || typeof category !== 'string') return null;

  return (
    <View style={styles.container}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={14}
          color={colors.secondary}
          style={styles.icon}
        />
      )}
      <Text style={styles.text}>{category}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.secondary,
  },
});
