import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../theme';
import { convertImageUrl } from '../../api/baseApi';

interface ProductSelectionCardProps {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  stock: number;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
}

export const ProductSelectionCard: React.FC<ProductSelectionCardProps> = ({
  id,
  name,
  price,
  imageUrl,
  stock,
  isSelected,
  onToggleSelect,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.selectableCard,
        isSelected && styles.selectedCard,
      ]}
      onPress={() => onToggleSelect(id)}
      activeOpacity={0.7}
    >
      <View style={styles.checkboxContainer}>
        <Icon
          name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
          size={28}
          color={isSelected ? colors.primary : colors.textSecondary}
        />
      </View>
      <View style={styles.cardContent}>
        {imageUrl ? (
          <Image
            source={{ uri: convertImageUrl(imageUrl) }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="image-off-outline" size={32} color={colors.textTertiary} />
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {name}
          </Text>
          <Text style={styles.price}>฿{price.toFixed(2)}</Text>
          <Text style={styles.stock}>คงเหลือ: {stock}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  selectableCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.divider,
    marginBottom: spacing.sm,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: '#E8F5E9',
  },
  checkboxContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: spacing.sm,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.divider,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  productName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  stock: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
