import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useGetProfileQuery, useChangeRoleMutation } from "../../api/userApi";
import { useGetSellerInfoQuery } from "../../api/sellerApi";
import { convertImageUrl } from "../../api/baseApi";

const ProfileScreen = ({ navigation }: any) => {
  const { user: authUser, logout } = useAuth();
  const {
    data: profileData,
    isLoading,
    refetch,
  } = useGetProfileQuery(undefined, {
    skip: !authUser,
  });

  // Use profile data from API if available, otherwise use auth user
  const user = profileData?.data || authUser;

  // Get seller info if user is a seller
  const { data: sellerData } = useGetSellerInfoQuery(user?.id || 0, {
    skip: !user?.id || (user?.role !== "Seller" && user?.role !== "Admin"),
  });
  const seller = sellerData?.data;

  // Change role mutation
  const [changeRole, { isLoading: isChangingRole }] = useChangeRoleMutation();

  // Refetch profile when screen is focused (only if authenticated)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (authUser) {
        refetch();
      }
    });
    return unsubscribe;
  }, [navigation, refetch, authUser]);

  const handleLogout = () => {
    Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบหรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากระบบ",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  if (isLoading && !user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Guest view - when user is not logged in
  if (!authUser) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.guestHeader}>
          <Icon name="account-circle" size={100} color="#4CAF50" />
          <Text style={styles.guestTitle}>ยินดีต้อนรับ</Text>
          <Text style={styles.guestSubtitle}>
            เข้าสู่ระบบเพื่อใช้งานฟีเจอร์ทั้งหมด
          </Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.registerButtonText}>สมัครสมาชิก</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ฟีเจอร์สำหรับสมาชิก</Text>

          <View style={styles.featureItem}>
            <Icon name="shopping" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>ติดตามประวัติการสั่งซื้อ</Text>
          </View>

          <View style={styles.featureItem}>
            <Icon name="map-marker" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>จัดการที่อยู่จัดส่ง</Text>
          </View>

          <View style={styles.featureItem}>
            <Icon name="heart" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>บันทึกรายการโปรด</Text>
          </View>

          <View style={styles.featureItem}>
            <Icon name="store" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>เปิดร้านค้าออนไลน์</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>การตั้งค่า</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Icon name="help-circle" size={24} color="#666" />
            <Text style={styles.menuText}>ช่วยเหลือและสนับสนุน</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>เวอร์ชัน 1.0.0</Text>
        </View>
      </ScrollView>
    );
  }

  // Logged in user view
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Icon name="pencil" size={20} color="#4CAF50" />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          {user?.imageUrl ? (
            <Image
              source={{ uri: convertImageUrl(user.imageUrl) }}
              style={styles.avatar}
              onError={(error) => {
                console.log("Image error:", error.nativeEvent.error);
              }}
            />
          ) : (
            <Icon name="account-circle" size={80} color="#4CAF50" />
          )}
        </View>
        <Text style={styles.userName}>
          {user?.firstName || ""} {user?.lastName || ""}
        </Text>
        <Text style={styles.userEmail}>{user?.email || ""}</Text>
        {user?.phoneNumber ? (
          <Text style={styles.userPhone}>{user.phoneNumber}</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>บัญชีของฉัน</Text>

        {/* Display current role */}
        {/* <View style={styles.roleInfoItem}>
          <Icon name="account-badge" size={24} color="#4CAF50" />
          <Text style={styles.roleInfoText}>
            Role ปัจจุบัน: <Text style={styles.roleHighlight}>{user?.role || "Customer"}</Text>
          </Text>
        </View> */}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("OrderHistory")}
        >
          <Icon name="shopping" size={24} color="#666" />
          <Text style={styles.menuText}>ประวัติการสั่งซื้อ</Text>
          <Icon name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="map-marker" size={24} color="#666" />
          <Text style={styles.menuText}>ที่อยู่จัดส่ง</Text>
          <Icon name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="heart" size={24} color="#666" />
          <Text style={styles.menuText}>รายการโปรด</Text>
          <Icon name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Seller Section - Show if user is a Seller or Admin */}
      {(user?.role === "Seller" || user?.role === "Admin") && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>สำหรับผู้ขาย</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (seller?.sellerId) {
                navigation.navigate("StoreDetail", {
                  sellerId: seller.sellerId,
                });
              } else {
                Alert.alert(
                  "แจ้งเตือน",
                  "ยังไม่พบข้อมูลร้านค้า กรุณาจัดการร้านค้าก่อน"
                );
              }
            }}
          >
            <Icon name="store-outline" size={24} color="#4CAF50" />
            <Text style={styles.menuText}>ดูหน้าร้านค้า</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("ManageStore")}
          >
            <Icon name="store" size={24} color="#4CAF50" />
            <Text style={styles.menuText}>จัดการร้านค้า</Text>
            <Icon name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>การตั้งค่า</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="bell" size={24} color="#666" />
          <Text style={styles.menuText}>การแจ้งเตือน</Text>
          <Icon name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="lock" size={24} color="#666" />
          <Text style={styles.menuText}>ความเป็นส่วนตัว</Text>
          <Icon name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="help-circle" size={24} color="#666" />
          <Text style={styles.menuText}>ช่วยเหลือและสนับสนุน</Text>
          <Icon name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#F44336" />
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>เวอร์ชัน 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  // Guest view styles
  guestHeader: {
    backgroundColor: "#fff",
    padding: 40,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  guestTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  guestSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginBottom: 15,
    width: "80%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#4CAF50",
    width: "80%",
    alignItems: "center",
  },
  registerButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  featureText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  // Logged in user styles
  header: {
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    position: "relative",
  },
  editButton: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 8,
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    zIndex: 1,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  userPhone: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 15,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  logoutText: {
    fontSize: 16,
    color: "#F44336",
    fontWeight: "600",
    marginLeft: 10,
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  version: {
    fontSize: 12,
    color: "#999",
  },
  // Role display styles
  roleInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#E8F5E9",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  roleInfoText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  roleHighlight: {
    fontWeight: "bold",
    color: "#4CAF50",
  },
  // Change role button styles
  changeRoleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
  },
  changeRoleButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    marginLeft: 15,
  },
});

export default ProfileScreen;
