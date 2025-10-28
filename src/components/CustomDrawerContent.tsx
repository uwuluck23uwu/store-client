import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { logout } from "../store/slices/authSlice";
import { useGetProfileQuery } from "../api/userApi";
import { convertImageUrl } from "../api/baseApi";

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const dispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: !authUser,
  });

  // Use profile data from API if available, otherwise use auth user
  const user = profileData?.data || authUser;

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollView}
      >
        {/* User Profile Section */}
        <View style={styles.profileSection}>
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
              <View style={styles.avatarPlaceholder}>
                <Icon name="account" size={50} color="#fff" />
              </View>
            )}
          </View>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {user?.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user.role === "Admin"
                  ? "Admin"
                  : user.role === "Seller"
                  ? "ผู้ขาย"
                  : "ลูกค้า"}
              </Text>
            </View>
          )}
        </View>

        {/* Drawer Menu Items */}
        <View style={styles.menuSection}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Logout Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#f44336" />
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: -12,
    paddingBottom: 12,
  },
  scrollView: {
    paddingTop: 12,
  },
  profileSection: {
    backgroundColor: "#4CAF50",
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#45a049",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#e8f5e9",
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  roleText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  menuSection: {
    flex: 1,
    paddingTop: 10,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    padding: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  logoutText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#f44336",
    fontWeight: "500",
  },
});

export default CustomDrawerContent;
