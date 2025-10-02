import React, { useState, useEffect } from "react";
import SidebarWithHeader from "./common/components/InventoryControllerSidebarWithHeader.jsx";
import { db } from "../firebase";
import { collection, query, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import { Package, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function InventoryStocks() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState([]);
  const [productMap, setProductMap] = useState({}); // branch_productId -> product info
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");

  const userInfo = {
    name: userProfile?.firstName || "Inventory Controller",
    subtitle: userProfile?.email || "Inventory Controller Email",
    badge: "Inventory Controller",
    profileImage: userProfile?.profileImage || "./placeholder.svg",
  };

  const formatDate = (ts) => {
    if (!ts) return "-";
    if (ts.toDate) return ts.toDate().toLocaleDateString();
    if (ts instanceof Date) return ts.toLocaleDateString();
    return new Date(ts).toLocaleDateString();
  };

  useEffect(() => {
    async function fetchStocks() {
      setLoading(true);
      try {
        const branchInfo = JSON.parse(localStorage.getItem("branchInfo")) || JSON.parse(sessionStorage.getItem("branchInfo"));
        if (!branchInfo?.id) {
          setLoading(false);
          return;
        }

        // Fetch branch_products
        const branchSnap = await getDocs(query(collection(db, "branch_products")));
        const branchProducts = branchSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(bp => bp.branchId === branchInfo.id);
        const branchProductIds = branchProducts.map(bp => bp.id);

        // Fetch all stocks
        const stockSnap = await getDocs(query(collection(db, "stocks"), orderBy("periodStart", "desc")));
        const allStocks = stockSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const filteredStocks = allStocks.filter(s => branchProductIds.includes(s.productId));

        // Map product info
        const productMapTemp = {};
        await Promise.all(
          branchProducts.map(async (bp) => {
            const masterDoc = await getDoc(doc(db, "master_products", bp.productId));
            if (!masterDoc.exists()) return;
            const masterData = masterDoc.data();

            // Supplier details
            let supplierData = { name: "-", email: "-", phone: "-" };
            if (masterData.supplier) {
              const supplierDoc = await getDoc(doc(db, "suppliers", masterData.supplier));
              if (supplierDoc.exists()) supplierData = supplierDoc.data();
            }

            productMapTemp[bp.id] = {
              name: masterData.name,
              category: masterData.category,
              supplier: supplierData,
              unitCost: masterData.unitCost || 0,
            };
          })
        );

        // Set productMap and populate filters
        setProductMap(productMapTemp);

        const categorySet = new Set();
        const supplierSet = new Set();
        Object.values(productMapTemp).forEach(p => {
          if (p.category) categorySet.add(p.category);
          if (p.supplier?.name) supplierSet.add(p.supplier.name);
        });
        setCategories([...categorySet]);
        setSuppliers([...supplierSet]);

        setStocks(filteredStocks);
      } catch (err) {
        console.error("Error fetching stocks:", err);
      }
      setLoading(false);
    }

    fetchStocks();
  }, []);

  // Filter stocks
  const filteredStocks = stocks.filter((s) => {
    if (!s.periodStart) return false;
    const date = s.periodStart.toDate();
    const prod = productMap[s.productId];
    const monthMatch = date.getMonth() === filterMonth && date.getFullYear() === filterYear;
    const categoryMatch = filterCategory ? prod?.category === filterCategory : true;
    const supplierMatch = filterSupplier ? prod?.supplier?.name === filterSupplier : true;
    return monthMatch && categoryMatch && supplierMatch;
  });

  // Totals
  const totalRecords = filteredStocks.length;
  const totalBeginningStock = filteredStocks.reduce((sum, s) => sum + (s.beginnningStock || 0), 0);
  const totalEndingStock = filteredStocks.reduce((sum, s) => sum + (s.endingStock || 0), 0);
  const totalInventoryValue = filteredStocks.reduce((sum, s) => {
    const prod = productMap[s.productId];
    return sum + ((prod?.unitCost || 0) * (s.beginnningStock || 0));
  }, 0);

  return (
    <SidebarWithHeader userInfo={userInfo} pageTitle="Inventory Stocks">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-semibold">Welcome back, {userInfo.name}!</h2>
          <p className="text-gray-600">Here’s the latest stock of your products.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <input
            type="month"
            value={`${filterYear}-${String(filterMonth + 1).padStart(2, "0")}`}
            onChange={(e) => {
              const [year, month] = e.target.value.split("-");
              setFilterYear(Number(year));
              setFilterMonth(Number(month) - 1);
            }}
            className="border px-2 py-1 rounded"
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">All Suppliers</option>
            {suppliers.map(sup => <option key={sup} value={sup}>{sup}</option>)}
          </select>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => window.print()}
          >
            Print Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
          <StatCard icon={<Package />} title="Stock Records" value={totalRecords} color="blue" />
          <StatCard icon={<TrendingUp />} title="Total Beginning Stock" value={totalBeginningStock} color="green" />
          <StatCard icon={<TrendingDown />} title="Total Ending Stock" value={totalEndingStock} color="red" />
          <StatCard icon={<Package />} title="Total Inventory Value" value={`₱${totalInventoryValue.toLocaleString()}`} color="purple" />
        </div>

        {/* Stocks Table */}
        <div className="bg-white rounded-xl shadow-sm border mt-4 print-table-container">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-[#160B53]">Stock History</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <p className="p-4 text-gray-500">Loading...</p>
            ) : filteredStocks.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 print-table">
                <thead className="bg-gray-50">
                  <tr>
                    {["Date","Product","Category","Supplier","Beginning","Week 1","Week 2","Week 3","Week 4","Ending","Unit Cost","Inventory Value"].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStocks.map(s => {
                    const prod = productMap[s.productId];
                    const inventoryValue = (prod?.unitCost || 0) * (s.beginnningStock || 0);
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{formatDate(s.periodStart)}</td>
                        <td className="px-4 py-2 font-medium">{prod?.name || "Unknown Product"}</td>
                        <td className="px-4 py-2 text-center">{prod?.category || "-"}</td>
                        <td className="px-4 py-2 text-center">{prod?.supplier?.name || "-"}</td>
                        <td className="px-4 py-2 text-center">{s.beginnningStock ?? 0}</td>
                        <td className="px-4 py-2 text-center">{s.weekOneStock ?? 0}</td>
                        <td className="px-4 py-2 text-center">{s.weekTwoStock ?? 0}</td>
                        <td className="px-4 py-2 text-center">{s.weekThreeStock ?? 0}</td>
                        <td className="px-4 py-2 text-center">{s.weekFourStock ?? 0}</td>
                        <td className="px-4 py-2 text-center font-semibold">{s.endingStock ?? 0}</td>
                        <td className="px-4 py-2 text-center">₱{(prod?.unitCost || 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-center font-semibold">₱{inventoryValue.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500">📦 No stock record found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style>
{`
  @media print {
    body * {
      visibility: hidden;
    }

    .print-table-container, .print-table-container * {
      visibility: visible;
    }

    .print-table-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      padding: 16px;
    }

    /* Hide table headers */
    .print-table thead {
      display: none;
    }

    /* Convert table rows to blocks */
    .print-table tbody tr {
      display: block;
      margin-bottom: 16px;
      border: 1px solid #000;
      padding: 8px;
      break-inside: avoid;
    }

    .print-table tbody td {
      display: block;
      text-align: left;
      border: none;
      padding: 2px 0;
    }

    /* Add labels for each field */
    .print-table tbody td:nth-child(1)::before { content: "Date: "; font-weight: bold; }
    .print-table tbody td:nth-child(2)::before { content: "Product: "; font-weight: bold; }
    .print-table tbody td:nth-child(3)::before { content: "Category: "; font-weight: bold; }
    .print-table tbody td:nth-child(4)::before { content: "Supplier: "; font-weight: bold; }
    .print-table tbody td:nth-child(5)::before { content: "Beginning Stock: "; font-weight: bold; }
    .print-table tbody td:nth-child(6)::before { content: "Week 1: "; font-weight: bold; }
    .print-table tbody td:nth-child(7)::before { content: "Week 2: "; font-weight: bold; }
    .print-table tbody td:nth-child(8)::before { content: "Week 3: "; font-weight: bold; }
    .print-table tbody td:nth-child(9)::before { content: "Week 4: "; font-weight: bold; }
    .print-table tbody td:nth-child(10)::before { content: "Ending Stock: "; font-weight: bold; }
    .print-table tbody td:nth-child(11)::before { content: "Unit Cost: "; font-weight: bold; }
    .print-table tbody td:nth-child(12)::before { content: "Inventory Value: "; font-weight: bold; }
  }
`}
</style>

    </SidebarWithHeader>
  );
}

// StatCard Component
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
