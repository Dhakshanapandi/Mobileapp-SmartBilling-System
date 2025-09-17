// navigation/AppNavigator.jsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Alert, Text, TouchableOpacity } from "react-native";

import DashboardScreen from "../screens/DashboardScreen";
import InvoicesScreen from "../screens/InvoiceListScreen";
import LoginScreen from "../screens/LoginScreen"; // ✅ Import Login screen
import ProductFormScreen from "../screens/ProductFormScreen";
import ProductListScreen from "../screens/ProductListScreen";
import ReportsScreen from "../screens/ReportsScreen";
import StaffFormScreen from "../screens/StaffFormScreen";
import StaffListScreen from "../screens/StaffListScreen";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// 🔹 Staff Stack
function StaffStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#2563eb" },
        headerTintColor: "#fff",
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 12, marginRight: 12 }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>☰</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="StaffList"
        component={StaffListScreen}
        options={{ title: "Staff Management" }}
      />
      <Stack.Screen
        name="StaffForm"
        component={StaffFormScreen}
        options={{ title: "Staff Form" }}
      />
    </Stack.Navigator>
  );
}

// 🔹 Product Stack
function ProductStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#2563eb" },
        headerTintColor: "#fff",
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 12, marginRight: 12 }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>☰</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ title: "Products" }}
      />
      <Stack.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={{ title: "Product Form" }}
      />
    </Stack.Navigator>
  );
}

// 🔹 Reports Stack
function ReportsStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#2563eb" },
        headerTintColor: "#fff",
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 12, marginRight: 12 }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>☰</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="ReportsMain"
        component={ReportsScreen}
        options={{ title: "Reports" }}
      />
    </Stack.Navigator>
  );
}

// 🔹 Invoices Stack
function InvoicesStack({ navigation }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#2563eb" },
        headerTintColor: "#fff",
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 12, marginRight: 12 }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>☰</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="InvoicesMain"
        component={InvoicesScreen}
        options={{ title: "Invoices" }}
      />
    </Stack.Navigator>
  );
}

// 🔹 Drawer Navigator
function DrawerNavigator({ navigation }) {
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }], // ✅ Go back to Login only
          });
        },
      },
    ]);
  };

  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: { backgroundColor: "#2563eb" },
        headerTintColor: "#fff",
        drawerStyle: { width: 220 },
        drawerLabelStyle: { fontSize: 15, fontWeight: "500" },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen
        name="Staff"
        component={StaffStack}
        options={{ headerShown: false, title: "Staff Management" }}
      />
      <Drawer.Screen
        name="Products"
        component={ProductStack}
        options={{ headerShown: false, title: "Products" }}
      />
      <Drawer.Screen
        name="Reports"
        component={ReportsStack}
        options={{ headerShown: false, title: "Reports" }}
      />
      <Drawer.Screen
        name="Invoices"
        component={InvoicesStack}
        options={{ headerShown: false, title: "Invoices" }}
      />

      {/* ✅ Logout */}
      <Drawer.Screen
        name="Logout"
        component={() => null}
        options={{ title: "Logout" }}
        listeners={{
          focus: handleLogout,
        }}
      />
    </Drawer.Navigator>
  );
}

// 🔹 Root Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
