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
  Platform,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { useCreateOrderMutation } from "../../api/orderApi";
import { clearCart } from "../../store/slices/cartSlice";
import { CartItem } from "../../types/api.types";
import { API_BASE_URL } from "../../api/baseApi";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";

interface SellerGroup {
  sellerId: number;
  sellerName: string;
  items: CartItem[];
  subtotal: number;
}

const CheckoutScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isQrCodeLoading, setIsQrCodeLoading] = useState<boolean>(false);

  // Create order mutation
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const finalTotal = totalAmount;

  useEffect(() => {
    if (selectedPayment === "Transfer" && finalTotal > 0) {
      const fetchQrCode = async () => {
        setIsQrCodeLoading(true);
        setQrCodeUrl(null);
        try {
          // Append a timestamp to prevent caching
          const url = `${API_BASE_URL}/api/payment/qrcode?amount=${finalTotal}&t=${new Date().getTime()}`;
          setQrCodeUrl(url);
        } catch (error) {
          Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลด QR Code ได้ กรุณาลองใหม่อีกครั้ง");
          console.error("Failed to fetch QR code:", error);
        } finally {
          setIsQrCodeLoading(false);
        }
      };

      fetchQrCode();
    } else {
      setQrCodeUrl(null);
    }
  }, [selectedPayment, finalTotal]);

  const handleDownloadQrCode = async () => {
    if (!qrCodeUrl) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== "granted") {
        Alert.alert(
          "ต้องการสิทธิ์การเข้าถึง",
          "กรุณาอนุญาตให้แอปเข้าถึงคลังรูปภาพเพื่อบันทึกรูปภาพ"
        );
        return;
      }

      const fileUri =
        (FileSystem as any).cacheDirectory + `qrcode_${Date.now()}.png`;
      const { uri } = await FileSystem.downloadAsync(qrCodeUrl, fileUri);

      await MediaLibrary.createAssetAsync(uri);
      Alert.alert("สำเร็จ", "บันทึก QR Code ลงในคลังรูปภาพของคุณแล้ว");
    } catch (error) {
      console.error("Failed to download QR code:", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถบันทึก QR Code ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // Group items by seller for display
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
    if (!selectedPayment) {
      Alert.alert(
        "กรุณาเลือกวิธีชำระเงิน",
        "กรุณาเลือกวิธีการชำระเงินก่อนทำการสั่งซื้อ"
      );
      return;
    }

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
              const orderItems = items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              }));

              const result = await createOrder({
                paymentMethod: selectedPayment,
                notes: "",
                items: orderItems,
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
              console.error("Order creation failed:", error);
              const errorMessage =
                error.data?.message ||
                error.message ||
                "ไม่สามารถสั่งซื้อได้";
              Alert.alert(
                "เกิดข้อผิดพลาด",
                errorMessage
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Display items grouped by seller */}
        {sellerGroups.map((group) => (
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
              <Text style={styles.subtotalValue}>
                ฿{group.subtotal.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

        {/* Payment Section - Single payment for entire order */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>ช่องทางชำระเงิน</Text>
          <Text style={styles.paymentNote}>
            ชำระเงินครั้งเดียวสำหรับทั้งออเดอร์
            ระบบจะแบ่งเงินให้แต่ละร้านโดยอัตโนมัติ
          </Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === "Cash" && styles.paymentSelected,
            ]}
            onPress={() => setSelectedPayment("Cash")}
          >
            <Icon
              name={
                selectedPayment === "Cash"
                  ? "radiobox-marked"
                  : "radiobox-blank"
              }
              size={24}
              color={selectedPayment === "Cash" ? "#4CAF50" : "#999"}
            />
            <Icon
              name="cash"
              size={24}
              color="#666"
              style={styles.paymentIcon}
            />
            <Text style={styles.paymentText}>เงินสด</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === "Transfer" && styles.paymentSelected,
            ]}
            onPress={() => setSelectedPayment("Transfer")}
          >
            <Icon
              name={
                selectedPayment === "Transfer"
                  ? "radiobox-marked"
                  : "radiobox-blank"
              }
              size={24}
              color={selectedPayment === "Transfer" ? "#4CAF50" : "#999"}
            />
            <Icon
              name="bank-transfer"
              size={24}
              color="#666"
              style={styles.paymentIcon}
            />
            <Text style={styles.paymentText}>โอนเงิน</Text>
          </TouchableOpacity>

          {/* Show Platform QR Code if Transfer is selected */}
          {selectedPayment === "Transfer" && (
            <View style={styles.qrCodeContainer}>
              <Text style={styles.qrCodeTitle}>สแกน QR Code เพื่อชำระเงิน</Text>
              {isQrCodeLoading && (
                <ActivityIndicator size="large" color="#4CAF50" />
              )}
              {qrCodeUrl && !isQrCodeLoading && (
                <Image
                  source={{ uri: qrCodeUrl }}
                  style={styles.qrCodeImage}
                  onLoad={() => setIsQrCodeLoading(false)} // Hide loader when image is loaded
                  onError={() => {
                    setIsQrCodeLoading(false);
                    Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดรูปภาพ QR Code ได้");
                  }}
                />
              )}
              <Text style={styles.qrCodeAmount}>
                ยอดชำระ: ฿{finalTotal.toFixed(2)}
              </Text>
              <Text style={styles.qrCodeNote}>
                โปรดชำระเงินตามจำนวนที่ระบุ และเก็บหลักฐานการโอนเงิน
              </Text>

              {qrCodeUrl && !isQrCodeLoading && (
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={handleDownloadQrCode}
                >
                  <Icon name="download" size={20} color="#fff" />
                  <Text style={styles.downloadButtonText}>
                    ดาวน์โหลด QR Code
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === "CreditCard" && styles.paymentSelected,
            ]}
            onPress={() => setSelectedPayment("CreditCard")}
          >
            <Icon
              name={
                selectedPayment === "CreditCard"
                  ? "radiobox-marked"
                  : "radiobox-blank"
              }
              size={24}
              color={selectedPayment === "CreditCard" ? "#4CAF50" : "#999"}
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

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>สรุปการชำระเงิน</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>ยอดรวมสินค้า</Text>
            <Text style={styles.summaryValue}>฿{totalAmount.toFixed(2)}</Text>
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
    marginBottom: 10,
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
  paymentSection: {
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  paymentNote: {
    fontSize: 13,
    color: "#666",
    marginBottom: 15,
    paddingHorizontal: 5,
    fontStyle: "italic",
    lineHeight: 18,
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
  qrCodeNote: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0288D1",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  section: {
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 10,
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
