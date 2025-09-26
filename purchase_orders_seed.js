// seed_purchase_orders.js
// Run with: node seed_purchase_orders.js

import { db } from "./src/firebase.js";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

// --- Hardcoded Purchase Orders ---
const purchaseOrders = [
  {
    po_id: "PO001",
    supplier: "Glamour Products PH",
    requested_by: "staff_001",
    status: "Pending",
    remarks: "Urgent restock",
    items: [
      { item_id: "POI001", product_name: "Argan Oil Hair Serum", variant: "100ml", quantity: 5, cost: 350, total: 1750 },
      { item_id: "POI002", product_name: "Keratin Shampoo", variant: "250ml", quantity: 3, cost: 200, total: 600 }
    ]
  },
  {
    po_id: "PO002",
    supplier: "Beauty Essentials Co.",
    requested_by: "staff_002",
    status: "Approved",
    remarks: "Monthly stock",
    items: [
      { item_id: "POI003", product_name: "Hair Conditioner", variant: "200ml", quantity: 4, cost: 180, total: 720 },
      { item_id: "POI004", product_name: "Hair Mask", variant: "150ml", quantity: 2, cost: 250, total: 500 }
    ]
  }
];

// --- Seed Function ---
async function seedPurchaseOrders() {
  try {
    for (const po of purchaseOrders) {
      // Reference for the purchase order document (under branch_makati by default)
      const poRef = doc(collection(db, "branches", "branch_makati", "purchase_orders"), po.po_id);

      // First, add Items subcollection (purchase_order_details)
      for (const item of po.items) {
        const itemRef = doc(collection(poRef, "purchase_orders_details"), item.item_id);
        await setDoc(itemRef, {
          productName: item.product_name,
          variant: item.variant,
          quantity: item.quantity,
          cost: item.cost,
          total: item.total
        });
        console.log(`  Purchase Order Detail added: ${item.product_name} (${item.variant})`);
      }

      // Then, add the main Purchase Order document
      await setDoc(poRef, {
        poNumber: po.po_id,
        supplier: po.supplier,
        requestedBy: po.requested_by,
        status: po.status,
        remarks: po.remarks,
        createdAt: serverTimestamp()
      });
      console.log(`Purchase Order added: ${po.po_id}`);
    }

    console.log("✅ Purchase Orders seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding purchase orders:", error);
  }
}

seedPurchaseOrders();
