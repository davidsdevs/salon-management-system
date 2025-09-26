import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SidebarWithHeader from "./common/components/InventoryControllerSidebarWithHeader.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Package, Truck, Users } from "lucide-react";

export default function InventoryProducts() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [branchProducts, setBranchProducts] = useState([]);
  const [masterProducts, setMasterProducts] = useState([]);
  const [suppliersData, setSuppliersData] = useState({});
  const [mergedProducts, setMergedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Filters
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSupplier, setFilterSupplier] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const userInfo = {
    name: userProfile?.firstName || "Inventory Controller",
    subtitle: userProfile?.email || "Inventory Controller Email",
    badge: "Inventory Controller",
    profileImage: userProfile?.profileImage || "./placeholder.svg",
  };

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);

      const branchInfo =
        JSON.parse(localStorage.getItem("branchInfo")) ||
        JSON.parse(sessionStorage.getItem("branchInfo"));

      if (!branchInfo?.id) {
        setLoading(false);
        return;
      }

      // Fetch branch_products
      const branchQuery = query(
        collection(db, "branch_products"),
        where("branchId", "==", branchInfo.id)
      );
      const branchSnap = await getDocs(branchQuery);
      const branchData = branchSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBranchProducts(branchData);

      // Fetch master_products
      const masterIds = branchData.map((p) => p.productId);
      const masterDataPromises = masterIds.map((id) => getDoc(doc(db, "master_products", id)));
      const masterDocs = await Promise.all(masterDataPromises);
      const masterData = masterDocs.filter((d) => d.exists()).map((d) => ({ id: d.id, ...d.data() }));
      setMasterProducts(masterData);

      // Fetch suppliers
      const supplierIds = [...new Set(masterData.map((m) => m.supplier))];
      const supplierPromises = supplierIds.map((id) => getDoc(doc(db, "suppliers", id)));
      const supplierDocs = await Promise.all(supplierPromises);
      const suppliersObj = {};
      supplierDocs.forEach((d) => {
        if (d.exists()) suppliersObj[d.id] = d.data().name;
      });
      setSuppliersData(suppliersObj);

      // Merge branch + master + supplier info
      const merged = branchData.map((bp) => {
  const master = masterData.find((m) => m.id === bp.productId);
  return {
    id: bp.id,          // branch product document ID
    productId: bp.id,    // pass branch product ID to details page
    name: master?.name || "N/A",
    category: master?.category || "N/A",
    productStatus: bp.productStatus,
    supplier: master?.supplier ? suppliersObj[master.supplier] : "N/A",
  };
});
      setMergedProducts(merged);

      setLoading(false);
    }

    fetchProducts();
  }, []);

  // Filtered, sorted, deduplicated
  const filteredSortedProducts = useMemo(() => {
    let data = [...mergedProducts];

    if (filterCategory !== "All") data = data.filter((p) => p.category === filterCategory);
    if (filterStatus !== "All") data = data.filter((p) => p.productStatus === filterStatus);
    if (filterSupplier !== "All") data = data.filter((p) => p.supplier === filterSupplier);

    if (searchQuery) {
      data = data.filter((p) =>
        Object.values(p).some((val) =>
          val.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Deduplicate by product name
    const grouped = {};
    data.forEach((p) => {
      if (!grouped[p.name]) {
        grouped[p.name] = { ...p };
      } else {
        if (p.productStatus === "Active") grouped[p.name].productStatus = "Active";
      }
    });
    data = Object.values(grouped);

    if (sortConfig.key) {
      data.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [mergedProducts, filterCategory, filterStatus, filterSupplier, searchQuery, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredSortedProducts.length / pageSize);
  const paginatedProducts = filteredSortedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  if (loading) return <div>Loading...</div>;

  const totalProducts = filteredSortedProducts.length;
  const activeProducts = filteredSortedProducts.filter((p) => p.productStatus === "Active").length;
  const suppliersCount = [...new Set(filteredSortedProducts.map((p) => p.supplier))].length;

  return (
    <SidebarWithHeader userInfo={userInfo} pageTitle="Branch Products">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-semibold">Welcome back, {userInfo.name}!</h2>
          <p className="text-gray-600">Here’s the latest overview of your products.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          <StatCard icon={<Package />} title="Total Products" value={totalProducts} color="blue" />
          <StatCard icon={<Truck />} title="Active Products" value={activeProducts} color="green" />
          <StatCard icon={<Users />} title="Suppliers" value={suppliersCount} color="purple" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mt-6 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search products..."
            className="border p-2 rounded-md"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select className="border p-2 rounded-md" onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}>
            <option value="All">All Categories</option>
            {[...new Set(mergedProducts.map((p) => p.category))].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select className="border p-2 rounded-md" onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
            <option value="All">All Statuses</option>
            {[...new Set(mergedProducts.map((p) => p.productStatus))].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className="border p-2 rounded-md" onChange={(e) => { setFilterSupplier(e.target.value); setCurrentPage(1); }}>
            <option value="All">All Suppliers</option>
            {[...new Set(mergedProducts.map((p) => p.supplier))].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                {["name", "category", "productStatus", "supplier"].map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="px-4 py-2 text-left font-medium cursor-pointer hover:bg-gray-100"
                  >
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                    {sortConfig.key === col && (
                      <span className="ml-1 text-xs">{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => (
                  <tr
  key={p.id}
  className="hover:bg-gray-50 cursor-pointer"
  onClick={() => navigate(`/inventory-products/${p.productId}`)}
>
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2">{p.category}</td>
                    <td className="px-4 py-2">{p.productStatus}</td>
                    <td className="px-4 py-2">{p.supplier}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </SidebarWithHeader>
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
