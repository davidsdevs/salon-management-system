// File: src/InventoryController/InventoryBorrowLend.jsx
"use client";
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import InventoryControllerSidebarWithHeader from "./common/components/InventoryControllerSidebarWithHeader";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function InventoryBorrowLend() {
  const { branchInfo, user } = useAuth();

  // --- State ---
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [requestTitle, setRequestTitle] = useState("");
  const [dateNeeded, setDateNeeded] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const LOW_STOCK_THRESHOLD = 5;

  // --- Fetch branches & products ---
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);

        const branchSnap = await getDocs(collection(db, "branches"));
        const branchData = branchSnap.docs
          .map((b) => ({ id: b.id, name: b.data()?.name || "" }))
          .filter((b) => b.id !== branchInfo?.id);
        if (!cancelled) setBranches(branchData);

        const productSnap = await getDocs(collection(db, "branch_products"));
        const productData = productSnap.docs.map((p) => ({
          id: p.id,
          productId: p.data()?.productId || "",
          name: p.data()?.productName || "",
          available: p.data()?.availableQuantity || 0,
          quantity: 0,
          selected: false,
        }));
        if (!cancelled) setProducts(productData);
      } catch (err) {
        console.error("❌ Error fetching branches/products:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [branchInfo?.id]);

  // --- Helpers ---
  const filteredProductsFor = (arr = products) => {
    const q = (searchTerm || "").trim().toLowerCase();
    if (!q) return arr;
    return arr.filter((p) => (p.name || "").toLowerCase().includes(q));
  };

  const toggleSelectById = (id) => {
    setProducts((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, selected: !p.selected, quantity: !p.selected ? p.quantity : 0 } : p
      );
      const allVisible = filteredProductsFor(prev).map((x) => x.id);
      const allSelectedVisible = allVisible.every(
        (vid) => updated.find((u) => u.id === vid)?.selected
      );
      setSelectAllChecked(allSelectedVisible);
      return updated;
    });
  };

  const setQuantityById = (id, value) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: value, selected: value > 0 ? true : p.selected } : p
      )
    );
  };

  const selectAllVisible = () => {
    setProducts((prev) => {
      const visible = filteredProductsFor(prev);
      const visibleIds = new Set(visible.map((v) => v.id));
      const newSelected = !selectAllChecked;
      const updated = prev.map((p) =>
        visibleIds.has(p.id)
          ? { ...p, selected: newSelected, quantity: newSelected ? p.quantity : 0 }
          : p
      );
      setSelectAllChecked(newSelected);
      return updated;
    });
  };

  // --- Submit flow ---
  const openConfirm = () => {
    const items = products.filter((p) => p.selected && p.quantity > 0);
    if (!selectedBranch) return alert("Select a branch.");
    if (!items.length) return alert("Select at least one product with quantity.");
    if (!reason.trim()) return alert("Provide a reason.");
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    const items = products.filter((p) => p.selected && p.quantity > 0);
    if (!items.length) {
      setConfirmOpen(false);
      return alert("No items selected.");
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "stock_transfer"), {
        fromBranchId: selectedBranch,
        toBranchId: branchInfo.id,
        transferType: "borrow_request",
        requestStatus: "Pending",
        status: "Pending",
        requestTitle: requestTitle.trim() || "Borrow Request",
        priority,
        dateNeeded: dateNeeded || null,
        reason: reason.trim(),
        products: items.map((p) => ({
          branchProductId: p.id,
          productId: p.productId,
          lendQuantity: p.quantity,
          returnedQuantity: 0,
        })),
        createdAt: serverTimestamp(),
        createdBy: user?.displayName || user?.uid || "unknown",
      });

      alert("Borrow request created successfully!");
      setSelectedBranch("");
      setRequestTitle("");
      setPriority("Normal");
      setDateNeeded("");
      setReason("");
      setProducts((prev) => prev.map((p) => ({ ...p, quantity: 0, selected: false })));
      setSearchTerm("");
      setSelectAllChecked(false);
      setConfirmOpen(false);
    } catch (err) {
      console.error("❌ Error creating borrow request:", err);
      alert("Error creating borrow request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const filteredProducts = filteredProductsFor();
  const selectedProducts = products.filter((p) => p.selected && p.quantity > 0);
  const totalSelected = selectedProducts.length;
  const totalQuantity = selectedProducts.reduce((s, p) => s + (Number(p.quantity) || 0), 0);

  const submitBtnClass =
    priority === "Urgent"
      ? "bg-red-600 hover:bg-red-700"
      : priority === "High"
      ? "bg-yellow-600 hover:bg-yellow-700"
      : "bg-blue-600 hover:bg-blue-700";

  const userInfo = {
    name: branchInfo?.name || "Inventory Controller",
    subtitle: branchInfo?.code || "Branch Information",
    badge: "Inventory Controller",
    profileImage: "./placeholder.svg",
  };

  // --- UI ---
  return (
    <InventoryControllerSidebarWithHeader
      userInfo={userInfo}
      pageTitle="Create Borrow / Lend Request"
    >
      <div className="p-4 space-y-6">
        {/* Meta Data + Products side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Details */}
          <div className="bg-white shadow rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold">Request Details</h3>
            <div>
              <label className="block text-sm font-medium">Borrow From Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full border px-3 py-2 rounded mt-1"
              >
                <option value="">Select branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Request Title</label>
              <input
                value={requestTitle}
                onChange={(e) => setRequestTitle(e.target.value)}
                className="w-full border px-3 py-2 rounded mt-1"
                placeholder="Enter request title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Date Needed</label>
              <input
                type="date"
                value={dateNeeded}
                onChange={(e) => setDateNeeded(e.target.value)}
                className="w-full border px-3 py-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border px-3 py-2 rounded mt-1"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Reason</label>
              <textarea
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border px-3 py-2 rounded mt-1"
                placeholder="Explain reason for request"
              />
            </div>
          </div>

          {/* Products */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Products</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selectAllChecked}
                    onChange={selectAllVisible}
                    className="h-4 w-4 accent-blue-600"
                    id="select-all"
                  />
                  <label htmlFor="select-all" className="text-sm">Select all</label>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="border px-3 py-2 rounded"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[400px] border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Select</th>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">Available</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-gray-500">
                        No products found
                      </td>
                    </tr>
                  ) : filteredProducts.map((p) => {
                    const low = p.available <= LOW_STOCK_THRESHOLD;
                    return (
                      <tr key={p.id} className="border-b">
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={p.selected}
                            onChange={() => toggleSelectById(p.id)}
                            className="h-4 w-4 accent-blue-600"
                          />
                        </td>
                        <td className="px-4 py-2">{p.name}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            low ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                          }`}>
                            {p.available}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            max={p.available}
                            value={p.quantity}
                            disabled={!p.selected}
                            onChange={(e) =>
                              setQuantityById(p.id, Math.max(0, Math.min(Number(e.target.value || 0), p.available)))
                            }
                            className="w-20 border px-2 py-1 rounded text-center disabled:bg-gray-100"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <p><span className="font-medium">Branch:</span> {branches.find(b => b.id === selectedBranch)?.name || "-"}</p>
            <p><span className="font-medium">Priority:</span> {priority}</p>
            <p><span className="font-medium">Products:</span> {totalSelected}</p>
            <p><span className="font-medium">Total Qty:</span> {totalQuantity}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Preview</h3>
            {selectedProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No products selected</p>
            ) : (
              <ul className="space-y-1">
                {selectedProducts.map((p) => (
                  <li key={p.id} className="flex justify-between text-sm">
                    <span>{p.name}</span>
                    <span>x {p.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            onClick={openConfirm}
            disabled={submitting}
            className={`${submitBtnClass} text-white py-2 px-6 rounded`}
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow">
            <h3 className="text-lg font-semibold mb-3">Confirm Request</h3>
            <p className="mb-4">Are you sure you want to create this borrow request?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                {submitting ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </InventoryControllerSidebarWithHeader>
  );
}
