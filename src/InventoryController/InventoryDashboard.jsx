import React from "react";
import SidebarWithHeader from "./common/components/InventoryControllerSidebarWithHeader.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { Package, Truck, AlertTriangle, FileText, Users, TrendingDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function InventoryDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const userInfo = {
    name: userProfile?.firstName || "Inventory Controller",
    subtitle: userProfile?.email || "Inventory Controller Email",
    badge: "Inventory Controller",
    profileImage: userProfile?.profileImage || "./placeholder.svg"
  };

  // Example low stock data
  const lowStockItems = [
    { id: 1, name: "Hair Serum", quantity: 3 },
    { id: 2, name: "Scissors", quantity: 5 },
    { id: 3, name: "Conditioner", quantity: 2 },
    { id: 4, name: "Bleach Powder", quantity: 1 },
  ];

  // Example slow-moving data (products with very low sales)
  const slowMovingProducts = [
    { name: "Hair Spray", sold: 5 },
    { name: "Comb Set", sold: 8 },
    { name: "Nail Polish", sold: 3 },
    { name: "Hair Gel", sold: 7 },
    { name: "Face Mask", sold: 4 },
  ];

  return (
    <SidebarWithHeader
      userInfo={userInfo}
      pageTitle="Inventory Controller Dashboard"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome back, {userInfo.name}!
              </h2>
              <p className="text-gray-600">
                Here's the latest overview of your inventory operations.
              </p>
            </div>
            <div className="text-4xl text-[#160B53]">
              <Package size={40} />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {/* Total Products */}
          <div className="bg-white p-4 rounded-lg shadow border flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-xl font-semibold">320</p>
            </div>
          </div>

          {/* Low Stock Count */}
          <div className="bg-white p-4 rounded-lg shadow border flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock</p>
              <p className="text-xl font-semibold">{lowStockItems.length}</p>
            </div>
          </div>

          {/* Slow-Moving Products */}
          <div className="bg-white p-4 rounded-lg shadow border flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingDown className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Slow-Moving</p>
              <p className="text-xl font-semibold">{slowMovingProducts.length}</p>
            </div>
          </div>

          {/* Incoming Deliveries */}
          <div className="bg-white p-4 rounded-lg shadow border flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-full">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Incoming Deliveries</p>
              <p className="text-xl font-semibold">5</p>
            </div>
          </div>

          {/* Suppliers */}
          <div className="bg-white p-4 rounded-lg shadow border flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Suppliers</p>
              <p className="text-xl font-semibold">15</p>
            </div>
          </div>
        </div>
        {/* Slow-Moving Products Analytics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            Slow-Moving Products
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={slowMovingProducts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sold" fill="blue" /> {/* Orange for slow-moving */}
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-2">
            These products have the lowest sales — consider promotions or bundles to move stock faster.
          </p>
        </div>
        {/* Recent Activity / Stock Movements */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Stock Movements
          </h3>
          <ul className="space-y-3">
            <li className="flex justify-between">
              <span>+ 50 Shampoo Bottles (Restocked)</span>
              <span className="text-sm text-gray-500">Today, 9:00 AM</span>
            </li>
            <li className="flex justify-between">
              <span>- 20 Hair Dye Kits (Sold)</span>
              <span className="text-sm text-gray-500">Yesterday, 3:45 PM</span>
            </li>
            <li className="flex justify-between">
              <span>+ 10 Hair Dryers (Supplier Delivery)</span>
              <span className="text-sm text-gray-500">Yesterday, 11:20 AM</span>
            </li>
          </ul>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Low Stock Alerts
          </h3>
          {lowStockItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg flex justify-between items-center bg-red-50"
                >
                  <span>{item.name}</span>
                  <span className="text-red-600 font-medium">
                    {item.quantity} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">All items are sufficiently stocked ✅</p>
          )}
        </div>

        
      </div>
    </SidebarWithHeader>
  );
}
