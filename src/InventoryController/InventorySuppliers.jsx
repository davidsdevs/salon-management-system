import React, { useState } from "react";
import SidebarWithHeader from "./common/components/InventoryControllerSidebarWithHeader.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Phone, Mail, MapPin } from "lucide-react";

// Dummy suppliers data
const allSuppliers = [
  {
    id: 1,
    name: "L'Oreal Philippines",
    contactPerson: "Maria Santos",
    phone: "+63 917 123 4567",
    email: "maria.santos@loreal.com",
    address: "Makati City, Metro Manila",
    products: ["Hair Serum", "Conditioner"],
  },
  {
    id: 2,
    name: "Wahl Distributors",
    contactPerson: "John Cruz",
    phone: "+63 917 987 6543",
    email: "john.cruz@wahl.com",
    address: "Quezon City, Metro Manila",
    products: ["Scissors", "Clippers"],
  },
  {
    id: 3,
    name: "Revlon Suppliers Inc.",
    contactPerson: "Ana Reyes",
    phone: "+63 915 555 1122",
    email: "ana.reyes@revlon.com",
    address: "Pasig City, Metro Manila",
    products: ["Bleach Powder", "Hair Color"],
  },
];

export default function Suppliers() {
  const { userProfile } = useAuth();

  const userInfo = {
    name: userProfile?.firstName || "Inventory Controller",
    subtitle: userProfile?.email || "Inventory Controller Email",
    badge: "Inventory Controller",
    profileImage: userProfile?.profileImage || "./placeholder.svg",
  };

  // State
  const [suppliers, setSuppliers] = useState(allSuppliers);
  const [search, setSearch] = useState("");

  // Apply search filter
  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SidebarWithHeader userInfo={userInfo} pageTitle="Suppliers">
      <div className="space-y-6">
        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
          <input
            type="text"
            placeholder="Search supplier..."
            className="border rounded-md px-3 py-2 w-full md:w-1/3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Supplier Directory
          </h3>
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">ID</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Contact</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Address</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Products</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSuppliers.map((s, i) => (
                <tr
                  key={s.id}
                  className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                >
                  <td className="px-4 py-3">{s.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {s.name}
                  </td>
                  <td className="px-4 py-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-500" /> {s.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-500" /> {s.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <MapPin size={14} className="text-gray-500" /> {s.address}
                  </td>
                  <td className="px-4 py-3 flex flex-wrap gap-2">
                    {s.products.map((p, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                      >
                        {p}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-6 text-gray-500"
                  >
                    No suppliers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarWithHeader>
  );
}