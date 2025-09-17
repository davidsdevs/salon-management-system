// seed.js
// Run with: node seed.js

import { db } from "./firebase.js";
import { collection, doc, setDoc } from "firebase/firestore";

// --- Hardcoded MasterProducts (10 products) ---
const products = [
  { product_id: "P001", item_name: "Argan Oil Hair Serum", category: "Hair Care", remarks: "Popular product" },
  { product_id: "P002", item_name: "Keratin Shampoo", category: "Hair Care", remarks: "" },
  { product_id: "P003", item_name: "Nail Polish - Red", category: "Nail Care", remarks: "Limited edition" },
  { product_id: "P004", item_name: "Hair Conditioner", category: "Hair Care", remarks: "" },
  { product_id: "P005", item_name: "Facial Cleanser", category: "Skin Care", remarks: "" },
  { product_id: "P006", item_name: "Hair Mask", category: "Hair Care", remarks: "" },
  { product_id: "P007", item_name: "Nail Polish - Pink", category: "Nail Care", remarks: "" },
  { product_id: "P008", item_name: "Shampoo Brush", category: "Tools", remarks: "" },
  { product_id: "P009", item_name: "Body Lotion", category: "Skin Care", remarks: "" },
  { product_id: "P010", item_name: "Hair Oil", category: "Hair Care", remarks: "" }
];

// --- Variants per product ---
const variants = {
  P001: [{ variant_id: "V001", size: "100ml", unit: "bottle" }, { variant_id: "V002", size: "50ml", unit: "bottle" }],
  P002: [{ variant_id: "V003", size: "250ml", unit: "bottle" }, { variant_id: "V004", size: "500ml", unit: "bottle" }],
  P003: [{ variant_id: "V005", size: "15ml", unit: "bottle" }],
  P004: [{ variant_id: "V006", size: "200ml", unit: "tube" }],
  P005: [{ variant_id: "V007", size: "100ml", unit: "tube" }],
  P006: [{ variant_id: "V008", size: "150ml", unit: "jar" }],
  P007: [{ variant_id: "V009", size: "15ml", unit: "bottle" }],
  P008: [{ variant_id: "V010", size: "1pc", unit: "piece" }],
  P009: [{ variant_id: "V011", size: "200ml", unit: "bottle" }],
  P010: [{ variant_id: "V012", size: "100ml", unit: "bottle" }]
};

// --- Branch Pricing per variant ---
const branchPricing = {
  V001: { BR001: { cost_price: 350, srp_otc: 500, srp_salon: 550, commission: 50, outright: true, available: true },
          BR002: { cost_price: 360, srp_otc: 520, srp_salon: 570, commission: 55, outright: true, available: true } },
  V002: { BR001: { cost_price: 200, srp_otc: 300, srp_salon: 330, commission: 30, outright: true, available: true } },
  V003: { BR001: { cost_price: 200, srp_otc: 300, srp_salon: 330, commission: 30, outright: true, available: true },
          BR002: { cost_price: 210, srp_otc: 320, srp_salon: 350, commission: 35, outright: true, available: true } },
  V004: { BR002: { cost_price: 380, srp_otc: 500, srp_salon: 550, commission: 50, outright: true, available: true } },
  V005: { BR001: { cost_price: 80, srp_otc: 120, srp_salon: 140, commission: 15, outright: true, available: true } },
  V006: { BR001: { cost_price: 180, srp_otc: 250, srp_salon: 280, commission: 25, outright: true, available: true } },
  V007: { BR002: { cost_price: 150, srp_otc: 220, srp_salon: 250, commission: 20, outright: true, available: true } },
  V008: { BR001: { cost_price: 250, srp_otc: 400, srp_salon: 450, commission: 35, outright: true, available: true } },
  V009: { BR002: { cost_price: 80, srp_otc: 120, srp_salon: 140, commission: 15, outright: true, available: true } },
  V010: { BR001: { cost_price: 120, srp_otc: 200, srp_salon: 220, commission: 25, outright: true, available: true } },
  V011: { BR002: { cost_price: 180, srp_otc: 250, srp_salon: 280, commission: 25, outright: true, available: true } },
  V012: { BR001: { cost_price: 300, srp_otc: 450, srp_salon: 500, commission: 40, outright: true, available: true } }
};

// --- Seed Function ---
async function seedFirestore() {
  try {
    for (const product of products) {
      const productRef = doc(collection(db, "MasterProducts"));
      await setDoc(productRef, product);
      console.log(`MasterProduct added: ${product.item_name}`);

      // Add Variants subcollection
      const productVariants = variants[product.product_id] || [];
      for (const variant of productVariants) {
        const variantRef = doc(collection(productRef, "Variants"));
        await setDoc(variantRef, variant);
        console.log(`  Variant added: ${variant.size}`);

        // Add BranchPricing subcollection
        const pricing = branchPricing[variant.variant_id] || {};
        for (const [branchId, priceData] of Object.entries(pricing)) {
          const pricingRef = doc(collection(variantRef, "BranchPricing"));
          await setDoc(pricingRef, { branch_id: branchId, ...priceData });
          console.log(`    Branch pricing added: ${branchId}`);
        }
      }
    }
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

seedFirestore();
