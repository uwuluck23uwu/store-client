import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useNavigation, DrawerActions } from "@react-navigation/native";

import HomeScreen from "../screens/home/HomeScreen";
import ProductListScreen from "../screens/product/ProductListScreen";
import ProductDetailScreen from "../screens/product/ProductDetailScreen";
import CategoryProductsScreen from "../screens/product/CategoryProductsScreen";
import CartScreen from "../screens/cart/CartScreen";
import MapScreen from "../screens/map/MapScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import CheckoutScreen from "../screens/order/CheckoutScreen";
import OrderHistoryScreen from "../screens/order/OrderHistoryScreen";
import AdminProductsScreen from "../screens/admin/AdminProductsScreen";
import AdminOrdersScreen from "../screens/admin/AdminOrdersScreen";
import CreateProductScreen from "../screens/admin/CreateProductScreen";
import EditProductScreen from "../screens/admin/EditProductScreen";
import ManageCategoriesScreen from "../screens/admin/ManageCategoriesScreen";
import CreateCategoryScreen from "../screens/admin/CreateCategoryScreen";
import EditCategoryScreen from "../screens/admin/EditCategoryScreen";
import ManageBannersScreen from "../screens/admin/ManageBannersScreen";
import CreateBannerScreen from "../screens/admin/CreateBannerScreen";
import EditBannerScreen from "../screens/admin/EditBannerScreen";
import ManageStoreScreen from "../screens/seller/ManageStoreScreen";
import StoreDetailScreen from "../screens/seller/StoreDetailScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import CustomDrawerContent from "../components/CustomDrawerContent";
import { RootState } from "../store/store";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const RootStack = createStackNavigator();

// Products Stack
const ProductsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProductListMain"
        component={ProductListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          title: "รายละเอียดสินค้า",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="CategoryProducts"
        component={CategoryProductsScreen}
        options={{
          title: "สินค้าตามหมวดหมู่",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="StoreDetail"
        component={StoreDetailScreen}
        options={{
          title: "ร้านค้า",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="ManageStore"
        component={ManageStoreScreen}
        options={{
          title: "จัดการร้านค้า",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="AddProduct"
        component={CreateProductScreen}
        options={{
          title: "เพิ่มสินค้า",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{
          title: "แก้ไขสินค้า",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Stack.Navigator>
  );
};

// Cart Stack
const CartStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CartMain"
        component={CartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          title: "ชำระเงิน",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Stack.Navigator>
  );
};

// Profile Stack
const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: "แก้ไขโปรไฟล์",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{
          title: "ประวัติการสั่งซื้อ",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          title: "รายละเอียดสินค้า",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="StoreDetail"
        component={StoreDetailScreen}
        options={{
          title: "ร้านค้า",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="ManageStore"
        component={ManageStoreScreen}
        options={{
          title: "จัดการร้านค้า",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="AddProduct"
        component={CreateProductScreen}
        options={{
          title: "เพิ่มสินค้า",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{
          title: "แก้ไขสินค้า",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Stack.Navigator>
  );
};

// Categories Stack
const AdminCategoriesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ManageCategories"
        component={ManageCategoriesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateCategory"
        component={CreateCategoryScreen}
        options={{
          title: "เพิ่มหมวดหมู่ใหม่",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="EditCategory"
        component={EditCategoryScreen}
        options={{
          title: "แก้ไขหมวดหมู่",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Stack.Navigator>
  );
};

// Banners Stack
const AdminBannersStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ManageBanners"
        component={ManageBannersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateBanner"
        component={CreateBannerScreen}
        options={{
          title: "เพิ่มแบนเนอร์ใหม่",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="EditBanner"
        component={EditBannerScreen}
        options={{
          title: "แก้ไขแบนเนอร์",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Stack.Navigator>
  );
};

// Admin Stack
const AdminProductsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminProductsMain"
        component={AdminProductsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateProduct"
        component={CreateProductScreen}
        options={{
          title: "เพิ่มสินค้าใหม่",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{
          title: "แก้ไขสินค้า",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Stack.Navigator>
  );
};

// Bottom Tab Navigator (wrapped inside Drawer)
const TabNavigator = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === "Admin";

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Icon.glyphMap = "home";

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Products") iconName = "shopping";
          else if (route.name === "Cart") iconName = "cart";
          else if (route.name === "Map") iconName = "map-marker";
          else if (route.name === "Admin") iconName = "shield-crown";
          else if (route.name === "Profile") iconName = "account";

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "gray",
        headerShown: true,
        headerStyle: {
          backgroundColor: "#4CAF50",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerLeft: () => (
          <Icon
            name="menu"
            size={28}
            color="#fff"
            style={{ marginLeft: 15 }}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "หน้าแรก" }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsStack}
        options={{ title: "สินค้า" }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{ title: "ตะกร้า" }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ title: "แผนที่" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ title: "โปรไฟล์" }}
      />
    </Tab.Navigator>
  );
};

// Drawer Navigator
const DrawerNavigator = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === "Admin";

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: "#4CAF50",
        drawerInactiveTintColor: "gray",
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
          drawerLabel: "หน้าแรก",
        }}
      />
      <Drawer.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{
          title: "ประวัติการสั่งซื้อ",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#4CAF50",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          drawerIcon: ({ color, size }) => (
            <Icon name="history" size={size} color={color} />
          ),
          drawerLabel: "ประวัติการสั่งซื้อ",
        }}
      />
      {isAdmin && (
        <Drawer.Screen
          name="ManageBanners"
          component={AdminBannersStack}
          options={{
            title: "จัดการแบนเนอร์",
            headerShown: true,
            headerStyle: {
              backgroundColor: "#4CAF50",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            drawerIcon: ({ color, size }) => (
              <Icon name="image-multiple" size={size} color={color} />
            ),
            drawerLabel: "จัดการแบนเนอร์ (Admin)",
          }}
        />
      )}
      {isAdmin && (
        <Drawer.Screen
          name="ManageCategories"
          component={AdminCategoriesStack}
          options={{
            title: "จัดการหมวดหมู่",
            headerShown: true,
            headerStyle: {
              backgroundColor: "#4CAF50",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            drawerIcon: ({ color, size }) => (
              <Icon name="folder-multiple" size={size} color={color} />
            ),
            drawerLabel: "จัดการหมวดหมู่ (Admin)",
          }}
        />
      )}
      {isAdmin && (
        <Drawer.Screen
          name="AdminProducts"
          component={AdminProductsStack}
          options={{
            title: "จัดการสินค้า",
            headerShown: true,
            headerStyle: {
              backgroundColor: "#4CAF50",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            drawerIcon: ({ color, size }) => (
              <Icon name="shield-crown" size={size} color={color} />
            ),
            drawerLabel: "จัดการสินค้า (Admin)",
          }}
        />
      )}
      {isAdmin && (
        <Drawer.Screen
          name="AdminOrders"
          component={AdminOrdersScreen}
          options={{
            title: "จัดการคำสั่งซื้อ",
            headerShown: true,
            headerStyle: {
              backgroundColor: "#4CAF50",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            drawerIcon: ({ color, size }) => (
              <Icon name="clipboard-text" size={size} color={color} />
            ),
            drawerLabel: "จัดการคำสั่งซื้อ (Admin)",
          }}
        />
      )}
    </Drawer.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: "card",
      }}
    >
      <RootStack.Screen name="Main" component={DrawerNavigator} />
      <RootStack.Group
        screenOptions={{
          presentation: "modal",
          headerShown: false,
        }}
      >
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Register" component={RegisterScreen} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
};

export default MainNavigator;
