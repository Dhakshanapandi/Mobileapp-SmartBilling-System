import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "../api/api";

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products/");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchProducts);
    return unsubscribe;
  }, [navigation]);

  const deleteProduct = async (id) => {
    Alert.alert("Confirm Delete", "Delete this product?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/products/${id}`);
            fetchProducts();
          } catch (err) {
            alert("Delete failed: " + err.message);
          }
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Products</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("ProductForm")}
      >
        <Text style={styles.addButtonText}>+ Add Product</Text>
      </TouchableOpacity>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.detail}>Code: {item.code}</Text>
            <Text style={styles.detail}>₹{item.price}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => navigation.navigate("ProductForm", { product: item })}>
                <Text style={styles.edit}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteProduct(item._id)}>
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
  addButton: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, marginBottom: 16 },
  addButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 12, elevation: 2 },
  name: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  detail: { fontSize: 14, color: "#6b7280" },
  actions: { flexDirection: "row", marginTop: 8, justifyContent: "space-between" },
  edit: { color: "#2563eb", fontWeight: "600" },
  delete: { color: "red", fontWeight: "600" },
});
