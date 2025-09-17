import { DrawerActions } from "@react-navigation/native"; // ✅ for Drawer
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../api/api";

export default function StaffListScreen({ navigation }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      const res = await api.get("/staff/get-staff");
      setStaff(res.data);
    } catch (err) {
      console.error("Error fetching staff:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchStaff);
    return unsubscribe;
  }, [navigation]);

  // ✅ Show Drawer Button (☰) in Header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={{ marginLeft: 12 }}
        >
          <Text style={{ fontSize: 22, color: "#fff" }}>☰</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const deleteStaff = async (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this staff?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/staff/delete-staff/${id}`);
            fetchStaff();
          } catch (err) {
            alert("Delete failed: " + err.message);
          }
        },
      },
    ]);
  };

  if (loading)
    return (
      <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
    );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Staff Management</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("StaffForm")}
      >
        <Text style={styles.addButtonText}>+ Add Staff</Text>
      </TouchableOpacity>

      <FlatList
        data={staff}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => navigation.navigate("StaffForm", { staff: item })}
              >
                <Text style={styles.edit}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteStaff(item._id)}>
                <Text style={styles.delete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f3f4f6" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  addButton: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  email: { fontSize: 14, color: "#6b7280" },
  actions: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "space-between",
  },
  edit: { color: "#2563eb", fontWeight: "600" },
  delete: { color: "red", fontWeight: "600" },
});
