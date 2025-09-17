// screens/InvoicesScreen.jsx
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import * as XLSX from "xlsx";
import api from "../api/api";

export default function InvoicesScreen() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState("all");
  const [customDate, setCustomDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState("all");
  const [staffList, setStaffList] = useState([]); // ✅ staff list

  // ✅ Fetch invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/invoices/list/");
      setInvoices(res.data);

      // Extract unique staff
      const staffUnique = [
        ...new Map(
          res.data
            .filter((inv) => inv.staffId)
            .map((inv) => [inv.staffId._id, inv.staffId])
        ).values(),
      ];
      setStaffList(staffUnique);
    } catch (err) {
      setError("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // ✅ Filter invoices
  const filterInvoices = () => {
    let filtered = invoices;

    if (selectedStaff !== "all") {
      filtered = filtered.filter(
        (inv) => inv.staffId && inv.staffId._id === selectedStaff
      );
    }

    if (selectedDate === "today") {
      filtered = filtered.filter((inv) => isToday(parseISO(inv.invoiceDate)));
    } else if (selectedDate === "yesterday") {
      filtered = filtered.filter((inv) =>
        isYesterday(parseISO(inv.invoiceDate))
      );
    } else if (selectedDate === "custom" && customDate) {
      filtered = filtered.filter(
        (inv) =>
          format(parseISO(inv.invoiceDate), "yyyy-MM-dd") ===
          format(customDate, "yyyy-MM-dd")
      );
    }

    return filtered;
  };

  const filteredInvoices = filterInvoices();
  const totalAmount = filteredInvoices.reduce(
    (sum, inv) => sum + (inv.totalAmount || 0),
    0
  );

  // ✅ Export invoices to Excel
  const exportToExcel = async () => {
    try {
      if (!filteredInvoices.length) {
        Alert.alert("No data", "No invoices to export");
        return;
      }

      const ws = XLSX.utils.json_to_sheet(
        filteredInvoices.map((inv) => ({
          "Invoice #": inv._id.slice(-6),
          Customer: inv.customerName,
          Staff: inv.staffId?.name || "N/A",
          "Total Amount": inv.totalAmount || 0,
          Date: format(parseISO(inv.invoiceDate), "yyyy-MM-dd"),
        }))
      );

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Invoices");
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      const fileUri = FileSystem.documentDirectory + "invoices.xlsx";
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Excel export failed:", error);
      Alert.alert("Error", "Failed to export invoices");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Invoices</Text>

      {/* Filters */}
      <View style={styles.card}>
        <Text style={styles.subHeading}>Filters</Text>

        {/* Date Filter */}
        <View style={styles.filterRow}>
          {["all", "today", "yesterday"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedDate === filter && styles.activeFilter,
              ]}
              onPress={() => setSelectedDate(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedDate === filter && { color: "white" },
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedDate === "custom" && styles.activeFilter,
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={[
                styles.filterText,
                selectedDate === "custom" && { color: "white" },
              ]}
            >
              Custom
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={customDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setSelectedDate("custom");
                setCustomDate(selectedDate);
              }
            }}
          />
        )}

        {/* ✅ Staff Filter (always show if staff exists) */}
        {staffList.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: "600", marginBottom: 6 }}>Staff</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedStaff === "all" && styles.activeFilter,
                ]}
                onPress={() => setSelectedStaff("all")}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedStaff === "all" && { color: "white" },
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>

              {staffList.map((staff) => (
                <TouchableOpacity
                  key={staff._id}
                  style={[
                    styles.filterButton,
                    selectedStaff === staff._id && styles.activeFilter,
                  ]}
                  onPress={() => setSelectedStaff(staff._id)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedStaff === staff._id && { color: "white" },
                    ]}
                  >
                    {staff.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Summary */}
      <View style={styles.card}>
        <Text>Total Invoices: {filteredInvoices.length}</Text>
        <Text>Total Amount: ₹{totalAmount.toFixed(2)}</Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportToExcel}>
          <Text style={styles.exportText}>Export to Excel</Text>
        </TouchableOpacity>
      </View>

      {/* Invoice List */}
      <View style={styles.card}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" />
        ) : error ? (
          <Text style={{ color: "red" }}>{error}</Text>
        ) : filteredInvoices.length === 0 ? (
          <Text style={{ textAlign: "center", color: "gray" }}>
            No invoices found
          </Text>
        ) : (
          filteredInvoices.map((inv) => (
            <View key={inv._id} style={styles.invoiceRow}>
              <Text style={styles.cell}>{inv._id.slice(-6)}</Text>
              <Text style={styles.cell}>{inv.customerName}</Text>
              <Text style={styles.cell}>{inv.staffId?.name || "N/A"}</Text>
              <Text style={styles.cell}>₹{inv.totalAmount || 0}</Text>
              <Text style={styles.cell}>
                {format(parseISO(inv.invoiceDate), "yyyy-MM-dd")}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  subHeading: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  filterRow: { flexDirection: "row", marginBottom: 12, flexWrap: "wrap" },
  filterButton: {
    backgroundColor: "#e5e7eb",
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilter: { backgroundColor: "#2563eb" },
  filterText: { color: "black", fontWeight: "600" },
  exportButton: {
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  exportText: { color: "white", fontWeight: "bold", textAlign: "center" },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 8,
  },
  cell: { flex: 1, textAlign: "center" },
});
