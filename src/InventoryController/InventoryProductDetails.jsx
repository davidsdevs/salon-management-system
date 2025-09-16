import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarWithHeader from "./common/components/InventoryControllerSidebarWithHeader.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { ArrowLeft } from "lucide-react";

// Dummy data for now
const allProducts = [
  { 
    id: 1, 
    name: "Hair Serum", 
    brand: "L'Oreal", 
    category: "Hair Care", 
    size: "250ml", 
    unit: "Bottle",
    stock: 3, 
    status: "Low Stock", 
    description: "A nourishing serum that revitalizes and strengthens hair.", 
    supplier: "L'Oreal Distributor", 
    image: "https://via.placeholder.com/150",
    priceSalon: 150, 
    priceRetail: 250
  },
  { 
    id: 2, 
    name: "Scissors", 
    brand: "Wahl", 
    category: "Tools", 
    size: "7 inch", 
    unit: "Piece",
    stock: 10, 
    status: "In Stock", 
    description: "Professional salon-grade scissors for precision cutting.", 
    supplier: "Wahl Official Supplier", 
    image: "https://via.placeholder.com/150",
    priceSalon: 500, 
    priceRetail: 750
  },
];

export default function InventoryProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const userInfo = {
    name: userProfile?.firstName || "Inventory Controller",
    subtitle: userProfile?.email || "Inventory Controller Email",
    badge: "Inventory Controller",
    profileImage: userProfile?.profileImage || "./placeholder.svg",
  };

  const product = allProducts.find((p) => p.id === parseInt(id));

  if (!product) {
    return (
      <SidebarWithHeader userInfo={userInfo} pageTitle="Product Details">
        <div className="p-6">
          <p className="text-gray-500">Product not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition"
          >
            Go Back
          </button>
        </div>
      </SidebarWithHeader>
    );
  }

  return (
    <SidebarWithHeader userInfo={userInfo} pageTitle="Product Details">
      <div className="p-6 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Products
        </button>

        {/* Product Card */}
        <div className="bg-white rounded-2xl shadow-md border p-6 flex flex-col md:flex-row gap-6">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-48 h-48 object-cover rounded-xl border"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
            <p className="text-gray-600">Brand: {product.brand}</p>
            <p className="text-gray-600">Category: {product.category}</p>
            <p className="text-gray-600">Supplier: {product.supplier}</p>

            {/* Extra Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Size</p>
                <p className="text-lg font-semibold">{product.size}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Unit</p>
                <p className="text-lg font-semibold">{product.unit}</p>
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <p className="text-sm text-gray-500">SRP (Salon Use)</p>
                <p className="text-lg font-semibold text-primary">
                  ₱{product.priceSalon}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <p className="text-sm text-gray-500">SRP (Over the Counter)</p>
                <p className="text-lg font-semibold text-primary">
                  ₱{product.priceRetail}
                </p>
              </div>
            </div>

            {/* Stock & Status */}
            <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium">
                Stock: {product.stock} {product.unit}(s)
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  product.status === "Low Stock"
                    ? "bg-red-100 text-red-700"
                    : product.status === "Out of Stock"
                    ? "bg-gray-200 text-gray-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {product.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-700">{product.description}</p>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4">
            <button className="px-5 py-2.5 rounded-lg bg-[#160B53] text-white hover:bg-[#160B53]/90 transition">
              Edit Product
            </button>
            <button className="px-5 py-2.5 rounded-lg bg-[#160B53] text-white hover:bg-[#160B53]/90 transition">
              Restock
            </button>
            <button className="px-5 py-2.5 rounded-lg bg-[#160B53] text-white hover:bg-[#160B53]/90 transition">
              Archive
            </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarWithHeader>
  );
}
