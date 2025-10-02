// seed.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase.js"; // ✅ using your firebase.js

async function seed() {
  try {
    // --- Stock Transfer #1 (2 products) ---
    await addDoc(collection(db, "stock_transfer"), {
      fromBranchId: "branch_makati",
      toBranchId: "branch_bgc",
      transferType: "Lend",
      status: "Completed",
      createdAt: serverTimestamp(),
      createdBy: "Admin",
      products: [
        {
          branchProductId: "N5L0CoFjAQF1xbzzPDlC",
          productId: "7Lc42cpbuJ11GfwjJME4",
          lendQuantity: 9,
          returnedQuantity: 4,
        },
        {
          branchProductId: "X9K0CoFjAB12xyzzPDkC",
          productId: "9Mc33qrsTu44HfwkKLO9",
          lendQuantity: 3,
          returnedQuantity: 0,
        },
      ],
    });

    // --- Stock Transfer #2 (3 products) ---
    await addDoc(collection(db, "stock_transfer"), {
      fromBranchId: "branch_bgc",
      toBranchId: "branch_makati",
      transferType: "Lend",
      status: "Pending",
      createdAt: serverTimestamp(),
      createdBy: "Manager",
      products: [
        {
          branchProductId: "A7L2PoFjAQF1vzzPQ9cL",
          productId: "4Bc55xyzTu77JfwjQWE2",
          lendQuantity: 15,
          returnedQuantity: 5,
        },
        {
          branchProductId: "B8M1ZoFjPQF9kzzLRdC",
          productId: "5De66rstUv88KfwjTYR3",
          lendQuantity: 10,
          returnedQuantity: 0,
        },
        {
          branchProductId: "C9N3VoFjRQF7mzzPOeV",
          productId: "6Ef77uvwWx99LfwjUZS4",
          lendQuantity: 6,
          returnedQuantity: 2,
        },
      ],
    });

    console.log("✅ Stock transfer seed data inserted successfully!");
  } catch (err) {
    console.error("❌ Error seeding stock_transfer data:", err);
  }
}

seed();