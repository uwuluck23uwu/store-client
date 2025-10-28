import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import { RootState } from "../../store/store";
import { useCreateOrderMutation } from "../../api/orderApi";
import { clearCart } from "../../store/slices/cartSlice";
import { useGetSellerByIdQuery } from "../../api/sellerApi";
import { CartItem } from "../../types/api.types";

interface SellerGroup {
  sellerId: number;
  sellerName: string;
  items: CartItem[];
  subtotal: number;
}

const CheckoutScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);
  const [selectedPayment, setSelectedPayment] = useState<{[sellerId: number]: string}>({});

  // Create order mutation
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const shippingFee = 50;
  const finalTotal = totalAmount + shippingFee;

  // Group items by seller
  const sellerGroups: SellerGroup[] = React.useMemo(() => {
    const grouped = items.reduce((acc, item) => {
      const sellerId = item.sellerId || 0;
      if (!acc[sellerId]) {
        acc[sellerId] = {
          sellerId,
          sellerName: item.sellerName || "ไม่ทราบชื่อร้าน",
          items: [],
          subtotal: 0,
        };
      }
      acc[sellerId].items.push(item);
      acc[sellerId].subtotal += item.price * item.quantity;
      return acc;
    }, {} as { [key: number]: SellerGroup });

    return Object.values(grouped);
  }, [items]);

  const handlePlaceOrder = async () => {
    // Check if all sellers have payment method selected
    const missingPayment = sellerGroups.some(
      (group) => !selectedPayment[group.sellerId]
    );

    if (missingPayment) {
      Alert.alert(
        "กรุณาเลือกวิธีชำระเงิน",
        "กรุณาเลือกวิธีการชำระเงินสำหรับทุกร้านค้า"
      );
      return;
    }

    // Get the first payment method (or you can implement logic to handle multiple)
    const firstPaymentMethod = Object.values(selectedPayment)[0] || "Cash";

    Alert.alert(
      "ยืนยันการสั่งซื้อ",
      `คุณต้องการสั่งซื้อสินค้าทั้งหมด ${
        items.length
      } รายการ\nยอดรวม ฿${finalTotal.toFixed(2)} หรือไม่?`,
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ยืนยัน",
          onPress: async () => {
            try {
              const result = await createOrder({
                addressId: 1, // TODO: ใช้ address ที่เลือก
                paymentMethod: firstPaymentMethod,
                notes: "",
              }).unwrap();

              if (result.isSuccess) {
                dispatch(clearCart());
                Alert.alert(
                  "สั่งซื้อสำเร็จ",
                  "คำสั่งซื้อของคุณได้รับการบันทึกแล้ว",
                  [
                    {
                      text: "ดูประวัติการสั่งซื้อ",
                      onPress: () =>
                        navigation.navigate("Profile", {
                          screen: "OrderHistory",
                        }),
                    },
                    {
                      text: "กลับหน้าแรก",
                      onPress: () => navigation.navigate("Home"),
                    },
                  ]
                );
              } else {
                Alert.alert("ไม่สำเร็จ", result.message);
              }
            } catch (error: any) {
              Alert.alert(
                "เกิดข้อผิดพลาด",
                error.data?.message || "ไม่สามารถสั่งซื้อได้"
              );
            }
          },
        },
      ]
    );
  };

  // Component for rendering seller payment section
  const SellerPaymentSection = ({ group }: { group: SellerGroup }) => {
    const { data: sellerData } = useGetSellerByIdQuery(group.sellerId, {
      skip: !group.sellerId,
    });

    const seller = sellerData?.data;
    const currentPayment = selectedPayment[group.sellerId];

    return (
      <View style={styles.sellerSection} key={group.sellerId}>
        {/* Seller Header */}
        <View style={styles.sellerHeader}>
          <Icon name="store" size={20} color="#4CAF50" />
          <Text style={styles.sellerName}>{group.sellerName}</Text>
        </View>

        {/* Items List */}
        <View style={styles.itemsList}>
          {group.items.map((item) => (
            <View key={item.cartId} style={styles.orderItem}>
              <Text style={styles.itemName} numberOfLines={1}>
                {String(item.productName || "")}
              </Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>
                ฿{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Subtotal */}
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>ยอดรวมร้านนี้</Text>
          <Text style={styles.subtotalValue}>฿{group.subtotal.toFixed(2)}</Text>
        </View>

        {/* Payment Methods */}
        <Text style={styles.paymentTitle}>ช่องทางชำระเงิน</Text>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            currentPayment === "Cash" && styles.paymentSelected,
          ]}
          onPress={() =>
            setSelectedPayment((prev) => ({ ...prev, [group.sellerId]: "Cash" }))
          }
        >
          <Icon
            name={currentPayment === "Cash" ? "radiobox-marked" : "radiobox-blank"}
            size={24}
            color={currentPayment === "Cash" ? "#4CAF50" : "#999"}
          />
          <Icon name="cash" size={24} color="#666" style={styles.paymentIcon} />
          <Text style={styles.paymentText}>เงินสด</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            currentPayment === "Transfer" && styles.paymentSelected,
          ]}
          onPress={() =>
            setSelectedPayment((prev) => ({
              ...prev,
              [group.sellerId]: "Transfer",
            }))
          }
        >
          <Icon
            name={
              currentPayment === "Transfer" ? "radiobox-marked" : "radiobox-blank"
            }
            size={24}
            color={currentPayment === "Transfer" ? "#4CAF50" : "#999"}
          />
          <Icon
            name="bank-transfer"
            size={24}
            color="#666"
            style={styles.paymentIcon}
          />
          <Text style={styles.paymentText}>โอนเงิน</Text>
        </TouchableOpacity>

        {/* Show QR Code if Transfer is selected */}
        {currentPayment === "Transfer" && seller?.qrCodeUrl && (
          <View style={styles.qrCodeContainer}>
            <Text style={styles.qrCodeTitle}>สแกน QR Code เพื่อชำระเงิน</Text>
            <Image source={{ uri: seller.qrCodeUrl }} style={styles.qrCodeImage} />
            <Text style={styles.qrCodeAmount}>ยอดชำระ: ฿{group.subtotal.toFixed(2)}</Text>
          </View>
        )}

        {currentPayment === "Transfer" && !seller?.qrCodeUrl && (
          <View style={styles.noQrCodeContainer}>
            <Icon name="alert-circle-outline" size={40} color="#FF9800" />
            <Text style={styles.noQrCodeText}>
              ร้านนี้ยังไม่ได้เพิ่ม QR Code สำหรับการชำระเงิน
            </Text>
            <Text style={styles.noQrCodeSubtext}>
              กรุณาเลือกวิธีชำระเงินอื่น หรือติดต่อร้านค้าโดยตรง
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.paymentOption,
            currentPayment === "CreditCard" && styles.paymentSelected,
          ]}
          onPress={() =>
            setSelectedPayment((prev) => ({
              ...prev,
              [group.sellerId]: "CreditCard",
            }))
          }
        >
          <Icon
            name={
              currentPayment === "CreditCard" ? "radiobox-marked" : "radiobox-blank"
            }
            size={24}
            color={currentPayment === "CreditCard" ? "#4CAF50" : "#999"}
          />
          <Icon
            name="credit-card"
            size={24}
            color="#666"
            style={styles.paymentIcon}
          />
          <Text style={styles.paymentText}>บัตรเครดิต/เดบิต</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Render each seller group */}
        {sellerGroups.map((group) => (
          <SellerPaymentSection key={group.sellerId} group={group} />
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>สรุปการชำระเงิน</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>ยอดรวมสินค้า</Text>
            <Text style={styles.summaryValue}>฿{totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>ค่าจัดส่ง</Text>
            <Text style={styles.summaryValue}>฿{shippingFee.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>ยอดรวมทั้งหมด</Text>
            <Text style={styles.totalValue}>฿{finalTotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.orderButton, isLoading && styles.buttonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="check-circle" size={20} color="#fff" />
              <Text style={styles.orderButtonText}>ยืนยันการสั่งซื้อ</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  sellerSection: {
    backgroundColor: "#fff",
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sellerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#4CAF50",
    marginBottom: 15,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  itemsList: {
    marginBottom: 10,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 15,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 15,
  },
  subtotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  paymentIcon: {
    marginLeft: 15,
  },
  paymentText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  qrCodeContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f9ff",
    borderRadius: 10,
    marginVertical: 15,
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderStyle: "dashed",
  },
  qrCodeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 10,
  },
  qrCodeAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 15,
  },
  noQrCodeContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF8E1",
    borderRadius: 10,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: "#FF9800",
  },
  noQrCodeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginTop: 10,
  },
  noQrCodeSubtext: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  section: {
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  footer: {
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  orderButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: "#9E9E9E",
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default CheckoutScreen;
