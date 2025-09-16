import React, { useState } from "react";
import SidebarWithHeader from "./common/components/InventoryControllerSidebarWithHeader.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

// Dummy data for now – you can fetch from API/DB later
const allProducts = [
  { id: 1, name: "Hair Serum", brand: "L'Oreal", category: "Hair Care", stock: 3, status: "Low Stock" },
  { id: 2, name: "Scissors", brand: "Wahl", category: "Tools", stock: 10, status: "In Stock" },
  { id: 3, name: "Conditioner", brand: "Dove", category: "Hair Care", stock: 2, status: "Low Stock" },
  { id: 4, name: "Bleach Powder", brand: "Revlon", category: "Hair Color", stock: 12, status: "In Stock" },
  { id: 5, name: "Nail Polish", brand: "O.P.I", category: "Nail Care", stock: 0, status: "Out of Stock" },
  { id: 6, name: "Hair Gel", brand: "Gatsby", category: "Hair Styling", stock: 7, status: "In Stock" },
  { id: 7, name: "Face Mask", brand: "Neutrogena", category: "Skin Care", stock: 5, status: "In Stock" },
  { id: 8, name: "Comb Set", brand: "Goody", category: "Tools", stock: 8, status: "In Stock" },
];

export default function InventoryProducts() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const userInfo = {
    name: userProfile?.firstName || "Inventory Controller",
    subtitle: userProfile?.email || "Inventory Controller Email",
    badge: "Inventory Controller",
    profileImage: userProfile?.profileImage || "./placeholder.svg",
  };

  // State for filtering, searching, pagination
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("All");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Extract unique filters
  const brands = ["All", ...new Set(allProducts.map((p) => p.brand))];
  const statuses = ["All", ...new Set(allProducts.map((p) => p.status))];
  const categories = ["All", ...new Set(allProducts.map((p) => p.category))];

  // Apply filters + search
  const filteredProducts = allProducts.filter((p) => {
    return (
      (brand === "All" || p.brand === brand) &&
      (status === "All" || p.status === status) &&
      (category === "All" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <SidebarWithHeader
      userInfo={userInfo}
      pageTitle="Inventory Products"
    >
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
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-md px-2 py-1">
              {statuses.map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Products List
          </h3>
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Brand</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Category</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Stock</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.map((p, i) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/inventory-products/details/${p.id}`)}

                  className={`cursor-pointer transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  } hover:bg-gray-100`}
                >
                  <td className="px-4 py-3">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3">{p.brand}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        p.status === "Low Stock"
                          ? "bg-red-100 text-red-700"
                          : p.status === "Out of Stock"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </SidebarWithHeader>
  );
}
