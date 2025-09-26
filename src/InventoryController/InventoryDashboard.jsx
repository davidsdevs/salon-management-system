import React, { useState } from "react";
import SidebarWithHeader from "./common/components/InventoryControllerSidebarWithHeader.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  Package,
  Truck,
  AlertTriangle,
  Users,
  TrendingDown,
  Clock,
} from "lucide-react";
import {
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
} from "recharts";

export default function InventoryDashboard() {
  const { userProfile } = useAuth();

  const userInfo = {
    name: userProfile?.firstName || "Inventory Controller",
    subtitle: userProfile?.email || "Inventory Controller Email",
    badge: "Inventory Controller",
    profileImage: userProfile?.profileImage || "./placeholder.svg",
  };

  // Mock Data
  const lowStockItems = [
    { id: 1, name: "Hair Serum", quantity: 3 },
    { id: 2, name: "Conditioner", quantity: 2 },
    { id: 3, name: "Bleach Powder", quantity: 1 },
  ];

  const slowMovingProducts = [
    { name: "Hair Spray", sold: 5 },
    { name: "Comb Set", sold: 8 },
    { name: "Nail Polish", sold: 3 },
  ];

  const expiringSoon = [
    { id: 1, name: "Shampoo", expiry: "2025-10-05" },
    { id: 2, name: "Face Mask", expiry: "2025-10-10" },
  ];

  // ✅ States
  const [tableFilter, setTableFilter] = useState("Products");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Mock Table Data
  const tableData = {
    Products: [
      { id: 1, name: "Shampoo", stock: 120, category: "Haircare" },
      { id: 2, name: "Conditioner", stock: 80, category: "Haircare" },
    ],
    Suppliers: [
      { id: 1, name: "ABC Supplies", contact: "abc@email.com" },
      { id: 2, name: "XYZ Trading", contact: "xyz@email.com" },
    ],
    Deliveries: [
      { id: 1, order: "#1024", item: "Shampoo", eta: "Today" },
      { id: 2, order: "#1025", item: "Conditioner", eta: "Tomorrow" },
    ],
  };

  // Sorting logic
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Apply search + sort
  const filteredData = [...tableData[tableFilter]]
    .filter((row) =>
      Object.values(row).some((val) =>
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  // Chart Data
  const stockTrends = [
    { date: "Mon", stockIn: 50, stockOut: 30 },
    { date: "Tue", stockIn: 40, stockOut: 20 },
    { date: "Wed", stockIn: 60, stockOut: 35 },
    { date: "Thu", stockIn: 30, stockOut: 50 },
    { date: "Fri", stockIn: 70, stockOut: 45 },
  ];

  const categoryBreakdown = [
    { name: "Haircare", value: 120 },
    { name: "Skincare", value: 80 },
    { name: "Tools", value: 40 },
  ];

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B"];

  return (
    <SidebarWithHeader
      userInfo={userInfo}
      pageTitle="Inventory Controller Dashboard"
    >
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-semibold">
            Welcome back, {userInfo.name}!
          </h2>
          <p className="text-gray-600">
            Here’s the latest overview of your inventory.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <StatCard
            icon={<Package />}
            title="Total Products"
            value="320"
            color="blue"
          />
          <StatCard
            icon={<AlertTriangle />}
            title="Low Stock"
            value={lowStockItems.length}
            color="red"
          />
          <StatCard
            icon={<TrendingDown />}
            title="Slow-Moving"
            value={slowMovingProducts.length}
            color="orange"
          />
          <StatCard
            icon={<Truck />}
            title="Incoming Deliveries"
            value="5"
            color="green"
          />
          <StatCard icon={<Users />} title="Suppliers" value="15" color="purple" />
        </div>

        {/* Enhanced Filterable Quick Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-3">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
              Quick Data View
            </h3>
            <div className="flex gap-3">
              <select
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                className="border border-gray-300 rounded-md p-2 px-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option>Products</option>
                <option>Suppliers</option>
                <option>Deliveries</option>
              </select>

              {/* Search */}
              <input
                type="text"
                placeholder="Search..."
                className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  {Object.keys(tableData[tableFilter][0]).map((col) => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className="px-4 py-2 text-left capitalize font-medium cursor-pointer hover:bg-gray-100"
                    >
                      {col}
                      {sortConfig.key === col && (
                        <span className="ml-1 text-xs">
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      {Object.values(row).map((val, idx) => (
                        <td key={idx} className="px-4 py-2 text-gray-600">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={Object.keys(tableData[tableFilter][0]).length}
                      className="text-center py-5 text-gray-400"
                    >
                      No matching results
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnalyticListCard
            title="Expiring Soon"
            items={expiringSoon.map((p) => `${p.name} - ${p.expiry}`)}
            icon={<Clock />}
            color="yellow"
          />

          <AnalyticListCard
            title="Low Stock Alerts"
            items={lowStockItems.map((i) => `${i.name} (${i.quantity} left)`)}
            icon={<AlertTriangle />}
            color="red"
          />

          <AnalyticListCard
            title="Slow Moving Products"
            items={slowMovingProducts.map((p) => `${p.name} (${p.sold} sold)`)}
            icon={<TrendingDown />}
            color="orange"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stock Trend Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Stock In vs Out</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stockTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="stockIn" stroke="#10B981" />
                <Line type="monotone" dataKey="stockOut" stroke="#EF4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </SidebarWithHeader>
  );
}

/* Reusable Components */
function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border flex items-center space-x-3">
      <div className={`p-3 bg-${color}-100 rounded-full text-${color}-600`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function AnalyticListCard({ title, items, icon, color = "blue" }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-3 bg-${color}-100 rounded-full text-${color}-600`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-2 text-sm text-gray-600 max-h-48 overflow-y-auto">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <li key={idx} className="flex items-center">
              <span className="mr-2">•</span> {item}
            </li>
          ))
        ) : (
          <li className="text-gray-400">No items</li>
        )}
      </ul>
    </div>
  );
}
