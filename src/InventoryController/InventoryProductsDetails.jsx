import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SidebarWithHeader from "./common/components/InventoryControllerSidebarWithHeader.jsx";
import { db } from "../firebase.js";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function InventoryProductsDetails() {
  const { branchProductId } = useParams();
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    async function fetchProductDetails() {
      setLoading(true);
      try {
        const branchDocRef = doc(db, "branch_products", branchProductId);
        const branchDoc = await getDoc(branchDocRef);

        if (!branchDoc.exists()) {
          setProductData(null);
          setLoading(false);
          return;
        }

        const branchProduct = { id: branchDoc.id, ...branchDoc.data() };

        const masterDocRef = doc(db, "master_products", branchProduct.productId);
        const masterDoc = await getDoc(masterDocRef);
        const master = masterDoc.exists() ? masterDoc.data() : {};

        let supplierName = "N/A";
        if (master.supplier) {
          const supplierDoc = await getDoc(doc(db, "suppliers", master.supplier));
          if (supplierDoc.exists()) supplierName = supplierDoc.data().name;
        }

        const formulaQuery = query(
          collection(db, "salon_use_products"),
          where("productId", "==", branchProduct.id)
        );
        const formulaSnap = await getDocs(formulaQuery);
        const formulas = formulaSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const stocksQuery = query(
          collection(db, "stocks"),
          where("productId", "==", branchProduct.id)
        );
        const stocksSnap = await getDocs(stocksQuery);
        const stocks = stocksSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        setProductData({ branchProduct, master, supplierName, formulas, stocks });
      } catch (err) {
        console.error("Error fetching product details:", err);
        setProductData(null);
      }
      setLoading(false);
    }

    if (branchProductId) fetchProductDetails();
    else setLoading(false);
  }, [branchProductId]);

  if (loading) return <div>Loading...</div>;
  if (!productData) return <div>Product not found</div>;

  const { branchProduct, master, supplierName, formulas, stocks } = productData;

  return (
    <SidebarWithHeader pageTitle={`Product Details: ${master.name || "N/A"}`}>
      <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
        {/* Image + Basic Info */}
        <div className="flex items-start gap-6">
          {master.imageUrl && (
            <img
              src={master.imageUrl}
              alt={master.name || "Product"}
              className="w-40 h-40 object-cover rounded-lg shadow"
            />
          )}
          <div>
            <h2
              className="text-2xl font-bold"
              style={{ color: "#160B53" }}
            >
              {master.name || "N/A"}
            </h2>
            <p className="text-gray-600 mt-1">{master.description || "No description available."}</p>
          </div>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailCard label="Category" value={master.category} />
          <DetailCard label="Status" value={branchProduct.productStatus} />
          <DetailCard label="Supplier" value={supplierName} />
          <DetailCard label="Shelf Life" value={master.shelfLife} />
          <DetailCard label="OTC Price" value={branchProduct.otcPrice} />
          <DetailCard label="SKU" value={master.sku} />
        </div>

        {/* Formulas */}
        <div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "#160B53" }}>
            Formulas (Salon Use Products)
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            {formulas.length > 0 ? (
              <ul className="list-disc pl-6 text-gray-700">
                {formulas.map((f) => (
                  <li key={f.id}>
                    Branch: {f.branchId || "N/A"}, Quantity: {f.quantityUse || "N/A"}{" "}
                    {f.unit || "ml"}, Percent: {f.quantityUsePercent || "N/A"}%
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No formulas found.</p>
            )}
          </div>
        </div>

        {/* Stocks */}
        <div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "#160B53" }}>
            Beginning Stock (This Month)
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            {stocks.length > 0 ? (
              <ul className="list-disc pl-6 text-gray-700">
                {stocks
                  .filter((s) => {
                    if (!s.periodStart) return false;
                    const stockDate = s.periodStart.toDate();
                    const now = new Date();
                    return (
                      stockDate.getMonth() === now.getMonth() &&
                      stockDate.getFullYear() === now.getFullYear()
                    );
                  })
                  .map((s) => (
                    <li key={s.id}>
                      <p>
                        <strong>
                          Current Stock for{" "}
                          {s.periodStart?.toDate().toLocaleString("default", {
                            month: "long",
                          })}
                          :
                        </strong>{" "}
                        {s.beginnningStock ?? 0}
                      </p>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-500">No stocks found for this month.</p>
            )}
          </div>
        </div>
      </div>
    </SidebarWithHeader>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-medium text-gray-800">{value || "N/A"}</p>
    </div>
  );
}
