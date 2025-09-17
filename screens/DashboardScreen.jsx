import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import api from "../api/api";
import Card from "../components/Card";

const screenWidth = Dimensions.get("window").width - 32;

// ✅ Utility to normalize missing dates with dayjs
function normalizeDailySales(dailySales) {
  if (!dailySales || dailySales.length === 0) return [];

  const sorted = [...dailySales].sort((a, b) => new Date(a._id) - new Date(b._id));
  const startDate = dayjs(sorted[0]._id);
  const endDate = dayjs(sorted[sorted.length - 1]._id);

  const allDates = [];
  let current = startDate;
  while (current.isBefore(endDate) || current.isSame(endDate)) {
    allDates.push(current.format("YYYY-MM-DD"));
    current = current.add(1, "day");
  }

  const salesMap = Object.fromEntries(sorted.map((d) => [d._id, d.total]));

  return allDates.map((d) => ({
    _id: d,
    total: salesMap[d] || 0,
  }));
}

export default function DashboardScreen() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/dashboard/admin");
        setSummary(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loading}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Failed to load dashboard data.</Text>
      </View>
    );
  }

  // ✅ Normalize daily sales
  const dailySales = normalizeDailySales(summary.dailySales);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>📊 Admin Dashboard</Text>

      {/* Summary Cards */}
      <View style={styles.row}>
        <Card title="Total Sales" color="#2563eb">
          <Text style={styles.valueWhite}>₹{summary.totalSales}</Text>
        </Card>
        <Card title="Invoices" color="#16a34a">
          <Text style={styles.valueWhite}>{summary.totalInvoices}</Text>
        </Card>
      </View>

      <View style={styles.row}>
        <Card title="Customers" color="#f59e0b">
          <Text style={styles.valueWhite}>{summary.totalCustomers}</Text>
        </Card>
        <Card title="Staff" color="#ef4444">
          <Text style={styles.valueWhite}>{summary.totalStaff}</Text>
        </Card>
      </View>

      {/* Sales by Staff */}
      <Card title="Sales by Staff" color="#fff" textColor="#111827">
        {summary.salesByStaff?.length > 0 ? (
          summary.salesByStaff.map((staff) => (
            <View key={staff._id} style={styles.listItem}>
              <Text style={styles.name}>{staff.staffName}</Text>
              <Text style={styles.sub}>
                ₹{staff.totalSales} • {staff.invoiceCount} invoices
              </Text>
            </View>
          ))
        ) : (
          <Text>No staff sales data.</Text>
        )}
      </Card>

      {/* Top Products */}
      <Card title="Top Products" color="#fff" textColor="#111827">
        {summary.topProducts?.length > 0 ? (
          summary.topProducts.map((prod) => (
            <View key={prod._id} style={styles.listItem}>
              <Text style={styles.name}>{prod.name || "N/A"} ({prod.code || "-"})</Text>
              <Text style={styles.sub}>
                {prod.totalSold} units • ₹{prod.revenue} 
              </Text>
            </View>
          ))
        ) : (
          <Text>No product data.</Text>
        )}
      </Card>

      {/* Daily Sales Chart */}
      <Card title="Daily Sales Trend" color="#fff" textColor="#111827">
        {dailySales.length > 0 ? (
          <LineChart
            data={{
              labels: dailySales.map((d) => dayjs(d._id).format("MM-DD")), // short date
              datasets: [
                {
                  data: dailySales.map((d) => d.total),
                  strokeWidth: 3,
                },
              ],
            }}
            width={screenWidth}
            height={250}
            yAxisLabel="₹"
            fromZero
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`, // blue line
              labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`, // gray labels
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#2563eb",
              },
              propsForBackgroundLines: {
                strokeDasharray: "3 3",
                stroke: "#d1d5db",
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 10,
            }}
          />
        ) : (
          <Text>No daily sales data.</Text>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f3f4f6" },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#111827",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  valueWhite: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
    color: "#fff",
  },
  listItem: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  name: { fontWeight: "600", fontSize: 15, color: "#111827" },
  sub: { fontSize: 13, color: "#6b7280" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { fontSize: 16, color: "#6b7280", marginTop: 8 },
  error: { fontSize: 16, color: "red" },
});
  