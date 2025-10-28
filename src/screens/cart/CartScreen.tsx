import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import {
  useGetCartQuery,
  useUpdateCartQuantityMutation,
  useRemoveFromCartMutation,
} from '../../api/cartApi';
import { setCartItems, updateItemQuantity, removeItem } from '../../store/slices/cartSlice';
import { RootState } from '../../store/store';
import { CartItem } from '../../types/api.types';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadow } from '../../theme';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { QuantityControl } from '../../components/common/QuantityControl';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { Section } from '../../components/common/Section';
import { SummaryRow } from '../../components/common/SummaryRow';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';

const CartScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { items, totalAmount, totalItems } = useSelector((state: RootState) => state.cart);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  const { data: cartData, isLoading } = useGetCartQuery();
  const [updateQuantity] = useUpdateCartQuantityMutation();
  const [removeFromCart] = useRemoveFromCartMutation();

  useEffect(() => {
    if (cartData?.data) {
      dispatch(setCartItems(cartData.data));
    }
  }, [cartData, dispatch]);

  const handleUpdateQuantity = async (cartId: number, newQuantity: number, stock: number) => {
    if (newQuantity > stock) {
      Alert.alert('ไม่สามารถเพิ่มได้', 'จำนวนสินค้าเกินสต็อกที่มี');
      return;
    }

    if (newQuantity < 1) {
      handleRemoveItem(cartId);
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(cartId));
    try {
      const result = await updateQuantity({ cartId, quantity: newQuantity }).unwrap();
      if (result.isSuccess) {
        dispatch(updateItemQuantity({ cartId, quantity: newQuantity }));
      } else {
        Alert.alert('ไม่สำเร็จ', result.message);
      }
    } catch (error: any) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถอัพเดทจำนวนได้');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartId: number) => {
    Alert.alert('ลบสินค้า', 'คุณต้องการลบสินค้านี้ออกจากตะกร้าหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบ',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await removeFromCart(cartId).unwrap();
            if (result.isSuccess) {
              dispatch(removeItem(cartId));
            } else {
              Alert.alert('ไม่สำเร็จ', result.message);
            }
          } catch (error) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบสินค้าได้');
          }
        },
      },
    ]);
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const isUpdating = updatingItems.has(item.cartId);

    return (
      <View style={styles.cartItem}>
        <View style={styles.imageContainer}>
          {item.productImage ? (
            <Image source={{ uri: item.productImage }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImage, styles.noImage]}>
              <Icon name="image-off" size={30} color={colors.textTertiary} />
            </View>
          )}
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {String(item.productName || '')}
          </Text>
          <PriceDisplay price={item.price} size="small" />
          <Text style={styles.stockText}>คงเหลือ: {item.stock}</Text>
        </View>

        <View style={styles.quantitySection}>
          <QuantityControl
            quantity={item.quantity}
            onIncrease={() => handleUpdateQuantity(item.cartId, item.quantity + 1, item.stock)}
            onDecrease={() => handleUpdateQuantity(item.cartId, item.quantity - 1, item.stock)}
            max={item.stock}
          />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleRemoveItem(item.cartId)}
          >
            <Icon name="delete" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <LoadingState message="กำลังโหลดตะกร้าสินค้า..." />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon="cart-outline"
        message="ตะกร้าสินค้าว่างเปล่า"
        description="เพิ่มสินค้าที่คุณชอบลงในตะกร้า"
        actionLabel="เลือกซื้อสินค้า"
        onAction={() => navigation.navigate('Products')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.cartId.toString()}
        contentContainerStyle={styles.listContent}
      />

      <Section style={styles.summary} noPadding>
        <View style={styles.summaryContent}>
          <SummaryRow label="จำนวนสินค้า" value={`${totalItems} ชิ้น`} />
          <SummaryRow label="รวมทั้งหมด" value={totalAmount} isTotal isHighlighted />
        </View>
        <PrimaryButton
          label="ดำเนินการชำระเงิน"
          icon="credit-card"
          onPress={() => {
            if (!user) {
              Alert.alert('กรุณาเข้าสู่ระบบ', 'กรุณาเข้าสู่ระบบเพื่อดำเนินการชำระเงิน', [
                { text: 'ยกเลิก', style: 'cancel' },
                { text: 'เข้าสู่ระบบ', onPress: () => navigation.navigate('Login') },
              ]);
              return;
            }
            navigation.navigate('Checkout');
          }}
        />
      </Section>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.sm,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.base,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.base,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.base,
    overflow: 'hidden',
    backgroundColor: colors.divider,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  stockText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  quantitySection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  deleteButton: {
    padding: spacing.xs,
  },
  summary: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  summaryContent: {
    padding: spacing.base,
  },
});

export default CartScreen;
