import React, { useState } from "react";
import SidebarWithHeader from "./common/components/InventoryControllerSidebarWithHeader.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { Edit3 } from "lucide-react";
// Dummy products data
const allProducts = [
  { id: 1, name: "Hair Serum", brand: "L'Oreal", category: "Hair Care", stock: 3, status: "Low Stock" },
  { id: 2, name: "Scissors", brand: "Wahl", category: "Tools", stock: 10, status: "In Stock" },
  { id: 3, name: "Conditioner", brand: "Dove", category: "Hair Care", stock: 2, status: "Low Stock" },
  { id: 4, name: "Bleach Powder", brand: "Revlon", category: "Hair Color", stock: 12, status: "In Stock" },
];

export default function StockManagement() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const userInfo = {
    name: userProfile?.firstName || "Inventory Controller",
    subtitle: userProfile?.email || "Inventory Controller Email",
    badge: "Inventory Controller",
    profileImage: userProfile?.profileImage || "./placeholder.svg",
  };

  const [products, setProducts] = useState(allProducts);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("All");
  const [category, setCategory] = useState("All");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("Restock");

  const brands = ["All", ...new Set(allProducts.map((p) => p.brand))];
  const categories = ["All", ...new Set(allProducts.map((p) => p.category))];
  const reasons = ["Restock", "Sold", "Damaged/Expired"];

  const openModal = (product) => {
    setSelectedProduct(product);
    setQuantity(0);
    setReason("Restock");
    setShowModal(true);
  };

  const handleUpdateStock = () => {
    if (!selectedProduct || quantity === 0) return;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              stock: Math.max(p.stock + quantity, 0),
              status:
                p.stock + quantity <= 0
                  ? "Out of Stock"
                  : p.stock + quantity < 5
                  ? "Low Stock"
                  : "In Stock",
            }
          : p
      )
    );

    setShowModal(false);
  };

  const filteredProducts = products.filter((p) => {
    return (
      (brand === "All" || p.brand === brand) &&
      (category === "All" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <SidebarWithHeader userInfo={userInfo} pageTitle="Stock Management">
      <div className="space-y-6">
        {/* Filters + Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search by product name..."
            className="border rounded-md px-3 py-2 w-full md:w-1/4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <select value={brand} onChange={(e) => setBrand(e.target.value)} className="border rounded-md px-2 py-1">
              {brands.map((b, i) => (
                <option key={i} value={b}>{b}</option>
              ))}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded-md px-2 py-1">
              {categories.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stock Management Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Stock</h3>
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Brand</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Stock</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p, i) => (
                <tr key={p.id} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                  <td className="px-4 py-3">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3">{p.brand}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      p.status === "Low Stock"
                        ? "bg-red-100 text-red-700"
                        : p.status === "Out of Stock"
                        ? "bg-gray-200 text-gray-700"
                        : "bg-green-100 text-green-700"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                        <button
                            onClick={() => openModal(p)}
                            className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                            title="Update Stock"
                        >
                            <Edit3 size={18} />
                        </button>
                    </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg p-6 w-80">
              <h3 className="text-lg font-semibold mb-4">Update Stock for {selectedProduct.name}</h3>
              <div className="flex flex-col gap-3">
                <input
                  type="number"
                  placeholder="Quantity (+/-)"
                  className="border px-3 py-2 rounded"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
                <select value={reason} onChange={(e) => setReason(e.target.value)} className="border px-2 py-1 rounded">
                  {reasons.map((r, i) => (
                    <option key={i} value={r}>{r}</option>
                  ))}
                </select>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setShowModal(false)} className="px-3 py-1 rounded bg-gray-200">Cancel</button>
                  <button onClick={handleUpdateStock} className="px-3 py-1 rounded bg-blue-600 text-white">Confirm</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarWithHeader>
  );
}
