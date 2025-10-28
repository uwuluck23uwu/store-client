import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight } from '../../theme';

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  showCount?: boolean;
  count?: number;
  size?: 'small' | 'medium' | 'large';
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  maxRating = 5,
  showCount = false,
  count,
  size = 'medium',
}) => {
  const iconSize = size === 'large' ? 24 : size === 'small' ? 14 : 18;
  const textSize = size === 'large' ? fontSize.lg : size === 'small' ? fontSize.xs : fontSize.sm;

  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }).map((_, index) => (
        <MaterialCommunityIcons
          key={index}
          name={index < Math.floor(rating) ? 'star' : index < rating ? 'star-half-full' : 'star-outline'}
          size={iconSize}
          color={colors.rating}
          style={styles.star}
        />
      ))}
      <Text style={[styles.ratingText, { fontSize: textSize }]}>
        {rating.toFixed(1)}
      </Text>
      {showCount && count !== undefined && (
        <Text style={[styles.countText, { fontSize: textSize }]}>
          ({count})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: spacing.xs,
  },
  ratingText: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  countText: {
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
});
