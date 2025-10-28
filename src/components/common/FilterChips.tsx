import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, fontSize, borderRadius, fontWeight } from '../../theme';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterChipsProps {
  title: string;
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  title,
  options,
  selectedValue,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
              ]}
              onPress={() => onSelect(option.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  chipsContainer: {
    paddingRight: spacing.base,
  },
  chip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  chipTextSelected: {
    color: colors.surface,
    fontWeight: fontWeight.semibold,
  },
});
