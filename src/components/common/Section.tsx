import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadow } from '../../theme';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  title,
  children,
  style,
  noPadding = false,
}) => {
  return (
    <View style={[styles.container, style]}>
      {title && typeof title === 'string' && <Text style={styles.title}>{title}</Text>}
      <View style={[styles.content, noPadding && styles.noPadding]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.base,
    marginBottom: spacing.base,
    ...shadow.base,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    padding: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  content: {
    padding: spacing.base,
  },
  noPadding: {
    padding: 0,
  },
});
