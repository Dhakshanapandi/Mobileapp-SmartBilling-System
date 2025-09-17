import { useLayoutEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from "../api/api";

export default function ProductFormScreen({ navigation, route }) {
  const product = route.params?.product;
  const [name, setName] = useState(product?.name || "");
  const [code, setCode] = useState(product?.code || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");

  useLayoutEffect(() => {
    navigation.setOptions({ title: product ? "Edit Product" : "Add Product" });
  }, [navigation, product]);

  const handleSave = async () => {
    try {
      if (product) {
        await api.put(`/products/${product._id}`, { name, code, price: Number(price) });
      } else {
        await api.post("/products/new-product/", { name, code, price: Number(price) });
      }
      navigation.goBack();
    } catch (err) {
      alert("Save failed: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{product ? "Edit Product" : "Add Product"}</Text>

      <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Code" style={styles.input} value={code} onChangeText={setCode} />
      <TextInput placeholder="Price" style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f3f4f6" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 12, backgroundColor: "#fff" },
  saveButton: { backgroundColor: "#2563eb", padding: 14, borderRadius: 8, marginTop: 10 },
  saveButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
