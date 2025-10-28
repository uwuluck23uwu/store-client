import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius, shadow } from '../../theme';
import { Category } from '../../types/api.types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All Categories Button */}
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategoryId === null && styles.categoryButtonActive,
          ]}
          onPress={() => onSelectCategory(null)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategoryId === null && styles.categoryTextActive,
            ]}
          >
            ทั้งหมด
          </Text>
        </TouchableOpacity>

        {/* Category Buttons */}
        {categories.map((category) => (
          <TouchableOpacity
            key={category.categoryId}
            style={[
              styles.categoryButton,
              selectedCategoryId === category.categoryId &&
                styles.categoryButtonActive,
            ]}
            onPress={() => onSelectCategory(category.categoryId)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategoryId === category.categoryId &&
                  styles.categoryTextActive,
              ]}
            >
              {category.categoryName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
});
