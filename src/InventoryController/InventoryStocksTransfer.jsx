// src/pages/inventory/InventoryStockTransfer.jsx
"use client";
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  updateDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import InventoryControllerSidebarWithHeader from "./common/components/InventoryControllerSidebarWithHeader";
import { Package, Clock, CheckCircle, Eye, Edit, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";

const HOVER_BLUE = "#160B53";

export default function InventoryStockTransfer() {
  const { branchInfo, user } = useAuth();

  const [transfers, setTransfers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTransfer, setViewTransfer] = useState(null);
  const [editTransfer, setEditTransfer] = useState(null);
  const [transferProducts, setTransferProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    lending: { key: "createdAt", direction: "desc" },
    borrowed: { key: "createdAt", direction: "desc" },
  });
  const [filterBranch, setFilterBranch] = useState("");
  const [borrowedFromBranches, setBorrowedFromBranches] = useState([]);
  const [inventoryValues, setInventoryValues] = useState({}); // { transferId: value }

  const userInfo = {
    name: branchInfo?.name || "Inventory Controller",
    subtitle: branchInfo?.code || "Branch Information",
    badge: "Inventory Controller",
    profileImage: "./placeholder.svg",
  };

  /** ---------- FETCH TRANSFERS AND BRANCHES ---------- */
  useEffect(() => {
    if (!branchInfo?.id) return;
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      try {
        // transfers where we are the lender
        const lendQ = query(
          collection(db, "stock_transfer"),
          where("fromBranchId", "==", branchInfo.id)
        );
        const lendSnap = await getDocs(lendQ);
        const lendData = lendSnap.docs.map((d) => ({ id: d.id, ...d.data(), _direction: "lending" }));

        // transfers where we are the borrower
        const borrowQ = query(
          collection(db, "stock_transfer"),
          where("toBranchId", "==", branchInfo.id)
        );
        const borrowSnap = await getDocs(borrowQ);
        const borrowData = borrowSnap.docs.map((d) => ({ id: d.id, ...d.data(), _direction: "borrowed" }));

        // fetch all branches
        const branchSnap = await getDocs(collection(db, "branches"));
        const branchData = branchSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        if (cancelled) return;

        const combined = [...lendData, ...borrowData].reduce((acc, cur) => {
          if (!acc.find((x) => x.id === cur.id)) acc.push(cur);
          return acc;
        }, []);

        setTransfers(combined);
        setBranches(branchData);

        // borrowed-from chips
        const borrowedFrom = borrowData.map((t) => t.fromBranchId).filter(Boolean);
        const uniqBorrowed = [...new Set(borrowedFrom)].map((bid) => ({
          id: bid,
          name: branchData.find((b) => b.id === bid)?.name || bid,
          count: borrowData.filter((t) => t.fromBranchId === bid).length,
        }));
        setBorrowedFromBranches(uniqBorrowed);

        // compute inventory values for each transfer (lending)
        // use Promise.all for better performance
        const invValues = {};
        await Promise.all(
          lendData.map(async (t) => {
            let value = 0;
            if (t.products && t.products.length) {
              await Promise.all(
                t.products.map(async (p) => {
                  if (!p.branchProductId) return;
                  try {
                    const bpSnap = await getDoc(doc(db, "branch_products", p.branchProductId));
                    if (bpSnap.exists()) {
                      // support both field names (OTCPrice or otcPrice)
                      const data = bpSnap.data() || {};
                      const price = (data.OTCPrice ?? data.otcPrice ?? data.OTCprice ?? 0) * 1;
                      const qty = Math.max(0, (p.lendQuantity || 0) - (p.returnedQuantity || 0));
                      value += price * qty;
                    }
                  } catch (err) {
                    console.warn("Error fetching branch_product for inventory calc", p.branchProductId, err);
                  }
                })
              );
            }
            invValues[t.id] = value;
          })
        );
        setInventoryValues(invValues);
      } catch (err) {
        console.error("❌ Error fetching transfers:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [branchInfo?.id]);

  /** ---------- HELPERS ---------- */
  const getBranchName = (id) => branches.find((b) => b.id === id)?.name || id || "N/A";

  const handleSort = (key, tableType) => {
    setSortConfig((prev) => ({
      ...prev,
      [tableType]:
        prev[tableType]?.key === key && prev[tableType].direction === "asc"
          ? { key, direction: "desc" }
          : { key, direction: "asc" },
    }));
  };

  const sortedTransfers = (data, tableType) => {
    const config = sortConfig[tableType] || { key: "createdAt", direction: "desc" };
    let sorted = [...data];
    if (filterBranch?.trim()) {
      const q = filterBranch.trim().toLowerCase();
      sorted = sorted.filter(
        (t) =>
          getBranchName(t.fromBranchId).toLowerCase().includes(q) ||
          getBranchName(t.toBranchId).toLowerCase().includes(q)
      );
    }
    if (config.key) {
      sorted.sort((a, b) => {
        let valA = a[config.key];
        let valB = b[config.key];
        if (valA?.toDate) valA = valA.toDate();
        if (valB?.toDate) valB = valB.toDate();
        if (valA < valB) return config.direction === "asc" ? -1 : 1;
        if (valA > valB) return config.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  };

  const getReturnProgress = (transfer) => {
    const products = transfer.products || [];
    if (!products.length) return { text: "No Products", percent: 0 };
    const totalLend = products.reduce((sum, p) => sum + (p.lendQuantity || 0), 0);
    const totalReturned = products.reduce((sum, p) => sum + (p.returnedQuantity || 0), 0);
    if (totalReturned === 0) return { text: "Not Returned", percent: 0 };
    const percent = Math.min(100, Math.round((totalReturned / totalLend) * 100));
    return { text: `${totalReturned}/${totalLend} returned`, percent };
  };

  const fetchProducts = async (transfer, setProductsModal) => {
    setProductsLoading(true);
    try {
      const products = await Promise.all(
        (transfer.products || []).map(async (p) => {
          let productName = "Unknown";
          if (p.productId) {
            try {
              const masterSnap = await getDoc(doc(db, "master_products", p.productId));
              if (masterSnap.exists()) productName = masterSnap.data().name || productName;
            } catch (err) {
              console.warn("Error reading master_products", p.productId, err);
            }
          }
          return { ...p, productName, returnedQuantity: p.returnedQuantity || 0 };
        })
      );
      setTransferProducts(products);
      setProductsModal(transfer);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Recompute inventory value for a single transfer and update state
  const recomputeInventoryForTransfer = async (transferId) => {
    const t = transfers.find((x) => x.id === transferId);
    if (!t) return;
    let value = 0;
    if (t.products && t.products.length) {
      await Promise.all(
        t.products.map(async (p) => {
          if (!p.branchProductId) return;
          try {
            const bpSnap = await getDoc(doc(db, "branch_products", p.branchProductId));
            if (bpSnap.exists()) {
              const data = bpSnap.data() || {};
              const price = (data.OTCPrice ?? data.otcPrice ?? data.OTCprice ?? 0) * 1;
              const qty = Math.max(0, (p.lendQuantity || 0) - (p.returnedQuantity || 0));
              value += price * qty;
            }
          } catch (err) {
            console.warn("Error fetching branch_product for recompute", p.branchProductId, err);
          }
        })
      );
    }
    setInventoryValues((prev) => ({ ...prev, [transferId]: value }));
    return value;
  };

  const handleSaveStatus = async () => {
    if (!editTransfer) return;
    if (!window.confirm("Are you sure you want to save these changes?")) return;

    try {
      const updatedProducts = transferProducts.map((p) => ({
        branchProductId: p.branchProductId,
        productId: p.productId,
        lendQuantity: p.lendQuantity,
        returnedQuantity: p.returnedQuantity || 0,
      }));

      const allReturned = updatedProducts.every((p) => p.returnedQuantity >= p.lendQuantity);
      const anyReturned = updatedProducts.some((p) => p.returnedQuantity > 0);
      const newStatus = allReturned ? "Completed" : anyReturned ? "Partial" : "Pending";

      const auditDetails = transferProducts.map((p, idx) => ({
        productId: p.productId,
        branchProductId: p.branchProductId,
        oldReturnedQty: editTransfer.products?.[idx]?.returnedQuantity || 0,
        newReturnedQty: p.returnedQuantity || 0,
      }));

      await addDoc(collection(db, "stock_transfer_audit"), {
        userId: user?.uid || "unknown",
        userName: user?.displayName || "unknown",
        timestamp: serverTimestamp(),
        action: "Update Returned Quantity",
        transferId: editTransfer.id,
        details: auditDetails,
      });

      await updateDoc(doc(db, "stock_transfer", editTransfer.id), {
        products: updatedProducts,
        status: newStatus,
      });

      // update local state
      setTransfers((prev) =>
        prev.map((t) => (t.id === editTransfer.id ? { ...t, products: updatedProducts, status: newStatus } : t))
      );

      // recompute inventory value for this transfer
      await recomputeInventoryForTransfer(editTransfer.id);

      setEditTransfer(null);
      setTransferProducts([]);
    } catch (err) {
      console.error("❌ Error saving status:", err);
    }
  };

  /** ---------- Borrow request functions ---------- */

  // Create a borrow request (you may wire this to a modal/UI elsewhere)
  // lenderBranchId: branch you want to borrow FROM (this becomes fromBranchId)
  // requestedProducts: array of { branchProductId, productId, quantity } where quantity is lendQuantity requested
  const handleCreateBorrowRequest = async (lenderBranchId, requestedProducts = []) => {
    if (!branchInfo?.id) return;
    if (!lenderBranchId || !requestedProducts.length) return;
    try {
      const payload = {
        fromBranchId: lenderBranchId, // lender is the owner of the products we request
        toBranchId: branchInfo.id, // we are the borrower
        transferType: "borrow_request",
        requestStatus: "Pending",
        status: "Pending",
        products: requestedProducts.map((p) => ({
          branchProductId: p.branchProductId,
          productId: p.productId,
          lendQuantity: p.quantity,
          returnedQuantity: 0,
        })),
        createdAt: serverTimestamp(),
        createdBy: user?.displayName || user?.uid || "unknown",
      };
      await addDoc(collection(db, "stock_transfer"), payload);
      // local refresh: reload transfers quickly by re-calling fetchAll logic:
      // simplest: push a placeholder and rely on next real fetch (or for better UX re-fetch transfers)
      // we'll re-run the fetch by manually fetching this new doc's value set (but to keep code minimal, we will just re-run fetchAll by toggling loading)
      setLoading(true);
      // re-fetch by re-running the effect: easiest is to call the effect's fetchAll by toggling branchInfo id (not ideal).
      // Instead perform a quick fetch for all transfers again:
      const lendQ = query(collection(db, "stock_transfer"), where("fromBranchId", "==", branchInfo.id));
      const lendSnap = await getDocs(lendQ);
      const lendData = lendSnap.docs.map((d) => ({ id: d.id, ...d.data(), _direction: d.data().fromBranchId === branchInfo.id ? "lending" : "borrowed" }));
      const borrowQ = query(collection(db, "stock_transfer"), where("toBranchId", "==", branchInfo.id));
      const borrowSnap = await getDocs(borrowQ);
      const borrowData = borrowSnap.docs.map((d) => ({ id: d.id, ...d.data(), _direction: d.data().fromBranchId === branchInfo.id ? "lending" : "borrowed" }));
      const combined = [...lendData, ...borrowData].reduce((acc, cur) => {
        if (!acc.find((x) => x.id === cur.id)) acc.push(cur);
        return acc;
      }, []);
      setTransfers(combined);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error creating borrow request:", err);
    }
  };

  // Approve incoming borrow request (only lender should call; current branch must be fromBranchId)
  const handleApproveRequest = async (transfer) => {
    if (!transfer || !transfer.id) return;
    try {
      await updateDoc(doc(db, "stock_transfer", transfer.id), {
        requestStatus: "Approved",
        status: "Pending", // approved but not yet returned/completed
        updatedAt: serverTimestamp(),
      });

      // audit
      await addDoc(collection(db, "stock_transfer_audit"), {
        userId: user?.uid || "unknown",
        userName: user?.displayName || "unknown",
        timestamp: serverTimestamp(),
        action: "Approve Borrow Request",
        transferId: transfer.id,
        details: [{ note: "Approved by lender", transferId: transfer.id }],
      });

      // update local
      setTransfers((prev) => prev.map((t) => (t.id === transfer.id ? { ...t, requestStatus: "Approved", status: "Pending" } : t)));
      // recompute inventory value (no immediate changes to products, but still safe)
      await recomputeInventoryForTransfer(transfer.id);
    } catch (err) {
      console.error("❌ Error approving request:", err);
    }
  };

  // Deny incoming borrow request
  const handleDenyRequest = async (transfer) => {
    if (!transfer || !transfer.id) return;
    try {
      await updateDoc(doc(db, "stock_transfer", transfer.id), {
        requestStatus: "Denied",
        status: "Denied",
        updatedAt: serverTimestamp(),
      });

      // audit
      await addDoc(collection(db, "stock_transfer_audit"), {
        userId: user?.uid || "unknown",
        userName: user?.displayName || "unknown",
        timestamp: serverTimestamp(),
        action: "Deny Borrow Request",
        transferId: transfer.id,
        details: [{ note: "Denied by lender", transferId: transfer.id }],
      });

      // update local
      setTransfers((prev) => prev.map((t) => (t.id === transfer.id ? { ...t, requestStatus: "Denied", status: "Denied" } : t)));
    } catch (err) {
      console.error("❌ Error denying request:", err);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  /** ---------- COMPUTE STATS ---------- */
  const totalTransfers = transfers.length;
  const totalLends = transfers.filter((t) => t._direction === "lending").length;
  const totalBorrowed = transfers.filter((t) => t._direction === "borrowed").length;
  const notReturnedTransfers = transfers.filter((t) => t.status !== "Completed").length;
  const totalInventoryValue = Object.values(inventoryValues).reduce((a, b) => a + b, 0);

  /** ---------- SPLIT TRANSFERS ---------- */
  const lendingTransfers = sortedTransfers(transfers.filter((t) => t._direction === "lending"), "lending");
  const borrowedTransfers = sortedTransfers(transfers.filter((t) => t._direction === "borrowed"), "borrowed");

  return (
    <InventoryControllerSidebarWithHeader userInfo={userInfo} pageTitle="Stock Transfers">
      <div className="space-y-6 p-2">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-semibold">Welcome back, {userInfo.name}!</h2>
          <p className="text-gray-600">Overview of transfers you lent and borrowed.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <StatCard icon={<Package />} title="Total Transfers" value={totalTransfers} color="blue" />
          <StatCard icon={<Clock />} title="Total Lends" value={totalLends} color="yellow" />
          <StatCard icon={<Clock />} title="Total Borrowed" value={totalBorrowed} color="purple" />
          <StatCard icon={<CheckCircle />} title="Not Returned" value={notReturnedTransfers} color="red" />
          <StatCard icon={<Package />} title="Inventory Value at Risk" value={`₱${totalInventoryValue.toLocaleString()}`} color="green" />
        </div>

        {/* Filter row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4">
          <div className="flex items-center gap-3">
            <input
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              placeholder="Filter by branch name..."
              className="px-3 py-2 border rounded w-64"
            />
            <button onClick={() => setFilterBranch("")} className="px-3 py-2 text-sm border rounded">Clear</button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            <span className="text-sm text-gray-600 mr-2">Borrowed from:</span>
            {borrowedFromBranches.length === 0 ? (
              <span className="text-xs text-gray-400">None</span>
            ) : (
              borrowedFromBranches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setFilterBranch(b.name)}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                  title={`${b.name} — ${b.count} transfer(s)`}
                >
                  {b.name} <span className="ml-2 text-xs text-gray-500">({b.count})</span>
                </button>
              ))
            )}
          </div>
           <a
            href="/inventory-stock-transfers/borrow-lend"
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          >
            Borrow/Lend
          </a>
        </div>

        {/* Lending Table */}
        <SectionTitle title="Lending Transfers" subtitle="Transfers where your branch lent items" />
        <TransferTable
          data={lendingTransfers}
          fetchProducts={fetchProducts}
          onView={(t) => fetchProducts(t, setViewTransfer)}
          onEdit={(t) => fetchProducts(t, setEditTransfer)}
          getBranchName={getBranchName}
          handleSort={(key) => handleSort(key, "lending")}
          sortConfig={sortConfig.lending}
          getReturnProgress={getReturnProgress}
          inventoryValues={inventoryValues}
          currentBranchId={branchInfo?.id}
          onApprove={handleApproveRequest}
          onDeny={handleDenyRequest}
        />

        {/* Borrowed Table */}
        <SectionTitle title="Borrowed Transfers" subtitle="Transfers where your branch borrowed items" />
        <TransferTable
          data={borrowedTransfers}
          fetchProducts={fetchProducts}
          onView={(t) => fetchProducts(t, setViewTransfer)}
          onEdit={(t) => fetchProducts(t, setEditTransfer)}
          getBranchName={getBranchName}
          handleSort={(key) => handleSort(key, "borrowed")}
          sortConfig={sortConfig.borrowed}
          getReturnProgress={getReturnProgress}
          currentBranchId={branchInfo?.id}
          // no approve/deny for borrowed table (only lenders approve)
          onApprove={handleApproveRequest}
          onDeny={handleDenyRequest}
        />

        {/* Modals */}
        {viewTransfer && (
          <ModalView
            transfer={viewTransfer}
            products={transferProducts}
            onClose={() => {
              setViewTransfer(null);
              setTransferProducts([]);
            }}
            getBranchName={getBranchName}
          />
        )}
        {editTransfer && (
          <ModalEdit
            transfer={editTransfer}
            products={transferProducts}
            onClose={() => {
              setEditTransfer(null);
              setTransferProducts([]);
            }}
            setProducts={setTransferProducts}
            handleSave={handleSaveStatus}
          />
        )}
      </div>
    </InventoryControllerSidebarWithHeader>
  );
}

/* ---------- Helper Components ---------- */
function SectionTitle({ title, subtitle }) {
  return (
    <div className="flex items-center justify-between mt-6">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border flex items-center space-x-3">
      <div className={`p-3 bg-${color}-100 rounded-full text-${color}-600`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-11/12 max-w-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><X /></button>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

/* Transfer Table */
function TransferTable({
  data = [],
  fetchProducts,
  onView,
  onEdit,
  getBranchName,
  handleSort,
  sortConfig,
  getReturnProgress,
  inventoryValues,
  currentBranchId,
  onApprove,
  onDeny,
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mt-3 overflow-x-auto">
         
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            {[{ key: "fromBranchId", label: "From" },
            { key: "toBranchId", label: "To" },
            { key: "status", label: "Status" },
            { key: "returned", label: "Returned" },
            { key: "createdAt", label: "Date" },
            inventoryValues ? { key: "value", label: "Inventory Value" } : null,
            { key: "actions", label: "Actions" }]
              .filter(Boolean)
              .map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.key !== "returned" && col.key !== "actions" && handleSort(col.key)}
                  className={`px-4 py-2 text-left font-medium cursor-pointer ${col.key !== "returned" && col.key !== "actions" ? "hover:bg-gray-100" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{col.label}</span>
                    {sortConfig?.key === col.key && <span className="text-xs">{sortConfig.direction === "asc" ? "▲" : "▼"}</span>}
                  </div>
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={7} className="text-center py-4 text-gray-400">No transfers</td></tr>
          ) : data.map((t) => {
            const progress = getReturnProgress(t);
            const invValue = inventoryValues?.[t.id];
            return (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{getBranchName(t.fromBranchId)}</td>
                <td className="px-4 py-2">{getBranchName(t.toBranchId)}</td>
                <td className="px-4 py-2">{t.status}{t.requestStatus ? ` • ${t.requestStatus}` : ""}</td>
                <td className="px-4 py-2">
                  <div className="bg-gray-100 rounded-full h-3 w-full">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: `${progress.percent}%` }}></div>
                  </div>
                  <p className="text-xs">{progress.text}</p>
                </td>
                <td className="px-4 py-2">{t.createdAt?.toDate?.().toLocaleDateString() || "N/A"}</td>
                {inventoryValues && <td className="px-4 py-2">{invValue !== undefined ? `₱${invValue.toLocaleString()}` : "N/A"}</td>}
                <td className="px-4 py-2 space-x-2">
                  {/* Approve/Deny: show only when this is an incoming borrow request for the lender */}
                  {t.requestStatus === "Pending" && currentBranchId === t.fromBranchId ? (
                    <>
                      <button onClick={() => onApprove?.(t)} className="px-2 py-1 rounded bg-green-50 text-green-700 border">Approve</button>
                      <button onClick={() => onDeny?.(t)} className="px-2 py-1 rounded bg-red-50 text-red-700 border">Deny</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => onView?.(t)} className="text-blue-500 hover:text-blue-700"><Eye size={16} /></button>
                      {/* only allow editing on lending transfers (your branch lent items) */}
                      {t._direction === "lending" && (
                        <button onClick={() => onEdit?.(t)} className="text-yellow-500 hover:text-yellow-700"><Edit size={16} /></button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* View Modal */
function ModalView({ transfer, products, onClose, getBranchName }) {
  return (
    <Modal title={`Transfer Details`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex justify-between">
          <p><strong>From:</strong> {getBranchName(transfer.fromBranchId)}</p>
          <p><strong>To:</strong> {getBranchName(transfer.toBranchId)}</p>
        </div>
        <p><strong>Status:</strong> {transfer.status}{transfer.requestStatus ? ` • ${transfer.requestStatus}` : ""}</p>

        <h4 className="font-semibold mt-3">Products</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
          {products.length === 0 ? (
            <p className="text-gray-400 col-span-2">No products in this transfer</p>
          ) : (
            products.map((p) => (
              <div key={p.branchProductId} className="bg-white border rounded p-3 shadow-sm flex flex-col">
                <span className="font-semibold">{p.productName}</span>
                <span className="text-sm text-gray-600 mt-1">
                  Lent: {p.lendQuantity} | Returned: {p.returnedQuantity || 0} | Remaining: {p.lendQuantity - (p.returnedQuantity || 0)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

/* Edit Modal */
function ModalEdit({ transfer, products, onClose, setProducts, handleSave }) {
  const handleChange = (idx, val) => {
    const updated = [...products];
    let number = Number(val);
    if (Number.isNaN(number)) number = 0;
    if (number < 0) number = 0;
    if (number > updated[idx].lendQuantity) number = updated[idx].lendQuantity;
    updated[idx].returnedQuantity = number;
    setProducts(updated);
  };

  return (
    <Modal title={`Edit Transfer`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex justify-between">
          <p><strong>From:</strong> {transfer.fromBranchName || transfer.fromBranchId}</p>
          <p><strong>To:</strong> {transfer.toBranchName || transfer.toBranchId}</p>
        </div>
        <p><strong>Status:</strong> {transfer.status}</p>

        <h4 className="font-semibold mt-3">Products</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
          {products.length === 0 ? (
            <p className="text-gray-400 col-span-2">No products to edit</p>
          ) : (
            products.map((p, idx) => (
              <div key={p.branchProductId} className="bg-white border rounded p-3 shadow-sm flex flex-col">
                <span className="font-semibold">{p.productName}</span>
                <div className="flex justify-between items-center mt-1 text-sm text-gray-600">
                  <span>Lent: {p.lendQuantity}</span>
                  <span>Returned:
                    <input
                      type="number"
                      min="0"
                      max={p.lendQuantity}
                      value={p.returnedQuantity || 0}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      className="ml-1 border px-2 py-1 w-20 rounded text-center"
                    />
                  </span>
                  <span>Remaining: {p.lendQuantity - (p.returnedQuantity || 0)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </div>
      </div>
    </Modal>
  );
}
