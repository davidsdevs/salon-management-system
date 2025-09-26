/**
 * seed.js
 * Seeds Firestore with sample data using lowercase collection names
 * and camelCase field names.
 * Run: node seed.js
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";
const serviceAccount = JSON.parse(readFileSync(new URL("./serviceAccountKey.json", import.meta.url)));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// --- Helpers ---
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  try {
    console.log("🌱 Starting seed...");

    // --- suppliers (5) ---
    const supplierNames = ["Beauty Essentials Co.", "Salon Tools Depot", "Glamour Products PH", "HairCare Plus", "ProBeauty Supplies"];
    const supplierIds = [];
    for (let i = 0; i < 5; i++) {
      const ref = db.collection("suppliers").doc();
      await ref.set({
        name: supplierNames[i],
        email: supplierNames[i].toLowerCase().replace(/\s+/g, "") + "@example.com",
        phone: `+63-900-0000${i + 1}`,
      });
      supplierIds.push(ref.id);
    }
    console.log(`✅ Suppliers seeded: ${supplierIds.length}`);

    // --- master_products (5) ---
    const masterProducts = [
      { name: "Keratin Treatment", category: "Hair Care", shelfLife: "2 years", unitCost: 120, sku: "KT-001", description: "Professional keratin treatment.", imageUrl: "https://via.placeholder.com/150", productStatus: "Active", supplier: randomItem(supplierIds) },
      { name: "Hair Serum", category: "Hair Care", shelfLife: "1 year", unitCost: 210, sku: "HS-002", description: "Nourishing serum.", imageUrl: "https://via.placeholder.com/150", productStatus: "Active", supplier: randomItem(supplierIds) },
      { name: "Scissors", category: "Tools", shelfLife: "5 years", unitCost: 900, sku: "SC-003", description: "Durable scissors.", imageUrl: "https://via.placeholder.com/150", productStatus: "Active", supplier: randomItem(supplierIds) },
      { name: "Bleach Powder", category: "Hair Color", shelfLife: "3 years", unitCost: 520, sku: "BP-004", description: "High-performance bleach.", imageUrl: "https://via.placeholder.com/150", productStatus: "Active", supplier: randomItem(supplierIds) },
      { name: "Hair Dye", category: "Hair Color", shelfLife: "2 years", unitCost: 300, sku: "HD-005", description: "Long-lasting dye.", imageUrl: "https://via.placeholder.com/150", productStatus: "Active", supplier: randomItem(supplierIds) },
    ];

    const masterProductIds = [];
    for (const mp of masterProducts) {
      const ref = db.collection("master_products").doc();
      await ref.set({
        ...mp,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      masterProductIds.push(ref.id);
    }
    console.log(`✅ Master products seeded: ${masterProductIds.length}`);

    // --- branch_products (5 per branch) ---
    const branchesSnap = await db.collection("branches").get();
    if (branchesSnap.empty) throw new Error("No branches found. Please create branches first.");
    const branchIds = branchesSnap.docs.map((d) => d.id);

    const branchProductIds = [];
    for (const branchId of branchIds) {
      for (let i = 0; i < 5; i++) {
        const mpId = randomItem(masterProductIds);
        const ref = db.collection("branch_products").doc();
        await ref.set({
          branchId,
          productId: mpId,
          otcPrice: randomInt(100, 500),
          productStatus: "Active",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        branchProductIds.push(ref.id);
      }
    }
    console.log(`✅ Branch products seeded: ${branchProductIds.length}`);

    // --- salon_use_products (5) ---
    for (let i = 0; i < 5; i++) {
      await db.collection("salon_use_products").doc().set({
        branchId: randomItem(branchIds),
        productId: randomItem(branchProductIds),
        quantityUse: randomInt(1, 10),
        quantityUsePercent: randomInt(5, 50),
        notes: "Sample usage",
        productStatus: "Active",
      });
    }
    console.log("✅ Salon use products seeded");

    // --- stocks (5) ---
    for (let i = 0; i < 5; i++) {
      const productId = randomItem(branchProductIds);
      await db.collection("stocks").doc().set({
        productId,
        periodStart: new Date(),
        periodEnd: new Date(),
        beginnningStock: randomInt(10, 50),
        weekOneStock: randomInt(5, 30),
        weekTwoStock: randomInt(5, 30),
        weekThreeStock: randomInt(5, 30),
        weekFourStock: randomInt(5, 30),
        endingStock: randomInt(5, 30),
        remarks: "Sample stock",
        status: "Active",
      });
    }
    console.log("✅ Stocks seeded");

    // --- stock_transfer (5) ---
    for (let i = 0; i < 5; i++) {
      await db.collection("stock_transfer").doc().set({
        productId: randomItem(branchProductIds),
        fromBranchId: randomItem(branchIds),
        toBranchId: randomItem(branchIds),
        status: "Completed",
        transferType: "Lend",
        lendQuantity: randomInt(1, 10),
        returnedQuantity: randomInt(0, 5),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: "Admin",
      });
    }
    console.log("✅ Stock transfers seeded");

    // --- purchase_orders & details (5 each) ---
    for (let i = 0; i < 5; i++) {
      const supplierId = randomItem(supplierIds);
      const poRef = db.collection("purchase_orders").doc();
      await poRef.set({
        supplierId,
        orderDate: new Date(),
        dateExpected: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        total: randomInt(500, 2000),
        createdBy: "Admin",
        approvedBy: "Manager",
        approvalDate: new Date(),
        notes: "Sample order",
      });

      for (let j = 0; j < 5; j++) {
        await db.collection("purchase_orders_details").doc().set({
          purchaseOrdersId: poRef.id,
          productId: randomItem(branchProductIds),
          quantity: randomInt(1, 10),
          totalPrice: randomInt(100, 500),
          status: "Pending",
          notes: "Sample detail",
        });
      }
    }
    console.log("✅ Purchase orders and details seeded");

    console.log("🎉 Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
