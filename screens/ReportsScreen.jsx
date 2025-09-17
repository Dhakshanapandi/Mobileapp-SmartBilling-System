import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx"; // ✅ Use XLSX instead of exceljs
import api from "../api/api";

export default function ReportsScreen() {
  const [dailyDate, setDailyDate] = useState(new Date());
  const [rangeFrom, setRangeFrom] = useState(new Date());
  const [rangeTo, setRangeTo] = useState(new Date());

  const [showDailyPicker, setShowDailyPicker] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [dailyReport, setDailyReport] = useState(null);
  const [rangeReport, setRangeReport] = useState(null);

  // ✅ Fetch Daily Report
  const fetchDailyReport = async () => {
    try {
      const dateStr = dailyDate.toISOString().split("T")[0];
      const res = await api.get(`/reports/daily?date=${dateStr}`);
      setDailyReport(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch daily report");
    }
  };

  // ✅ Fetch Range Report
  const fetchRangeReport = async () => {
    try {
      const fromStr = rangeFrom.toISOString().split("T")[0];
      const toStr = rangeTo.toISOString().split("T")[0];
      const res = await api.get(`/reports/range?from=${fromStr}&to=${toStr}`);
      setRangeReport(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch range report");
    }
  };

  // ✅ Export to Excel using XLSX
  const exportToExcel = async (data, fileName) => {
    try {
      if (!data || data.length === 0) {
        Alert.alert("No Data", "No invoices to export");
        return;
      }

      // 1. Convert JSON → Sheet
      const ws = XLSX.utils.json_to_sheet(
        data.map((inv) => ({
          "Invoice #": inv._id?.slice(-6),
          Customer: inv.customerName,
          "Total Amount": inv.totalAmount,
          Date: new Date(inv.invoiceDate).toLocaleDateString(),
        }))
      );

      // 2. Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");

      // 3. Write workbook as base64
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      // 4. Save file
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 5. Share
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Excel export failed:", error);
      Alert.alert("Error", "Excel export failed");
    }
  };

  // ✅ Render invoices
  const renderInvoices = (invoices) =>
    invoices && invoices.length > 0 ? (
      invoices.map((item) => (
        <View key={item._id} style={styles.invoiceRow}>
          <Text style={styles.cell}>{item._id?.slice(-6)}</Text>
          <Text style={styles.cell}>{item.customerName}</Text>
          <Text style={styles.cell}>₹{item.totalAmount}</Text>
          <Text style={styles.cell}>
            {new Date(item.invoiceDate).toLocaleDateString()}
          </Text>
        </View>
      ))
    ) : (
      <Text style={{ textAlign: "center", color: "gray", marginTop: 8 }}>
        No invoices found
      </Text>
    );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Reports</Text>

      {/* DAILY REPORT */}
      <View style={styles.card}>
        <Text style={styles.subHeading}>Daily Report</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDailyPicker(true)}
        >
          <Text style={styles.dateText}>{dailyDate.toDateString()}</Text>
        </TouchableOpacity>
        {showDailyPicker && (
          <DateTimePicker
            value={dailyDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowDailyPicker(false);
              if (selectedDate) setDailyDate(selectedDate);
            }}
          />
        )}

        <TouchableOpacity style={styles.fetchButton} onPress={fetchDailyReport}>
          <Text style={styles.fetchText}>Fetch</Text>
        </TouchableOpacity>

        {dailyReport && (
          <>
            <Text>Total Sales: ₹{dailyReport.totalSales}</Text>
            <Text>Invoices: {dailyReport.count}</Text>
            {renderInvoices(dailyReport.invoices)}
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() =>
                exportToExcel(
                  dailyReport.invoices,
                  `daily-report-${dailyReport.date}.xlsx`
                )
              }
            >
              <Text style={styles.exportText}>Export to Excel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* RANGE REPORT */}
      <View style={styles.card}>
        <Text style={styles.subHeading}>Range Report</Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowFromPicker(true)}
        >
          <Text style={styles.dateText}>From: {rangeFrom.toDateString()}</Text>
        </TouchableOpacity>
        {showFromPicker && (
          <DateTimePicker
            value={rangeFrom}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowFromPicker(false);
              if (selectedDate) setRangeFrom(selectedDate);
            }}
          />
        )}

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowToPicker(true)}
        >
          <Text style={styles.dateText}>To: {rangeTo.toDateString()}</Text>
        </TouchableOpacity>
        {showToPicker && (
          <DateTimePicker
            value={rangeTo}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowToPicker(false);
              if (selectedDate) setRangeTo(selectedDate);
            }}
          />
        )}

        <TouchableOpacity
          style={styles.fetchButton}
          onPress={fetchRangeReport}
        >
          <Text style={styles.fetchText}>Fetch</Text>
        </TouchableOpacity>

        {rangeReport && (
          <>
            <Text>
              From: {rangeReport.from} - To: {rangeReport.to}
            </Text>
            <Text>Total Sales: ₹{rangeReport.totalSales}</Text>
            <Text>Invoices: {rangeReport.count}</Text>
            {renderInvoices(rangeReport.invoices)}
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() =>
                exportToExcel(
                  rangeReport.invoices,
                  `range-report-${rangeReport.from}-to-${rangeReport.to}.xlsx`
                )
              }
            >
              <Text style={styles.exportText}>Export to Excel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subHeading: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  dateButton: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  dateText: { color: "white", fontWeight: "bold", textAlign: "center" },
  fetchButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  fetchText: { color: "white", fontWeight: "bold", textAlign: "center" },
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
