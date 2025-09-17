import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from "../api/api";

export default function StaffFormScreen({ route, navigation }) {
  const staff = route.params?.staff;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (staff) {
      setName(staff.name || "");
      setEmail(staff.email || "");
      setPassword(""); // don’t fetch actual password for security, but allow setting new one
    }
  }, [staff]);

  const handleSubmit = async () => {
    try {
      if (staff) {
        await api.put(`/staff/edit-staff/${staff._id}`, { name, email, password });
        Alert.alert("Success", "Staff updated successfully");
      } else {
        await api.post("/staff/staff-create/", { name, email, password });
        Alert.alert("Success", "Staff added successfully");
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{staff ? "Edit Staff" : "Add Staff"}</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder={staff ? "New Password (leave blank if unchanged)" : "Password"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>{staff ? "Update" : "Add"} Staff</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f3f4f6" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  submitButton: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8 },
  submitText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
