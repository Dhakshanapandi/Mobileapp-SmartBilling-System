import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Card({ title, children, color = "#2563eb", textColor = "#fff" }) {
  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      {title && <Text style={[styles.title, { color: textColor }]}>{title}</Text>}
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 12,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: { fontSize: 14, fontWeight: "bold", marginBottom: 6 },
});
