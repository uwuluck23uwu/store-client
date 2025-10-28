import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius, fontWeight, shadow } from '../../theme';
import { Product } from '../../types/api.types';

interface ProductManageCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductManageCard: React.FC<ProductManageCardProps> = ({
  product,
  onEdit,
  onDelete,
}) => {
  const statusColor = product.isActive ? colors.success : colors.error;
  const statusText = product.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.noImage]}>
              <Icon name="image-off" size={30} color={colors.textTertiary} />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {product.productName}
          </Text>
          <Text style={styles.price}>฿{product.price.toFixed(2)}</Text>
          <Text style={styles.stock}>คงเหลือ: {product.stock} {product.unit}</Text>
          {product.categoryName && (
            <Text style={styles.category}>{product.categoryName}</Text>
          )}
          <Text style={[styles.status, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(product)}
          >
            <Icon name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(product)}
          >
            <Icon name="delete" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
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
  content: {
    flexDirection: 'row',
    padding: spacing.base,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.base,
    overflow: 'hidden',
    marginRight: spacing.base,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    backgroundColor: colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  stock: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  category: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  status: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  actions: {
    justifyContent: 'space-around',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  editButton: {
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  deleteButton: {
    padding: spacing.sm,
  },
});
