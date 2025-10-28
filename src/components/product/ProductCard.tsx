import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadow } from '../../theme';
import { StockBadge } from '../common/StockBadge';
import { PriceDisplay } from '../common/PriceDisplay';
import { convertImageUrl } from '../../api/baseApi';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  stock: number;
  sellerName?: string;
  onPress?: () => void;
  showEditButton?: boolean;
  onEditPress?: () => void;
  showDeleteButton?: boolean;
  onDeletePress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  name,
  price,
  imageUrl,
  stock,
  sellerName,
  onPress,
  showEditButton = false,
  onEditPress,
  showDeleteButton = false,
  onDeletePress,
}) => {
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: convertImageUrl(imageUrl) }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <MaterialCommunityIcons
              name="image-off-outline"
              size={48}
              color={colors.textTertiary}
            />
            <Text style={styles.placeholderText}>ไม่มีรูปภาพ</Text>
          </View>
        )}
        {showEditButton && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={(e) => {
              e.stopPropagation();
              onEditPress?.();
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="pencil" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        {showDeleteButton && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              onDeletePress?.();
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="delete" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {name}
        </Text>
        <PriceDisplay price={price} size="medium" style={styles.price} />
        <StockBadge stock={stock} size="small" />
        {sellerName && (
          <Text style={styles.sellerName} numberOfLines={1}>
            {sellerName}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    flex: 1,
    margin: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadow.base,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: colors.divider,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.error,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholderText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  productInfo: {
    padding: spacing.md,
  },
  productName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    minHeight: 35,
  },
  price: {
    marginBottom: spacing.sm,
  },
  sellerName: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
