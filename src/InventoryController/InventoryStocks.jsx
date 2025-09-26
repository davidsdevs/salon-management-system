import React, { useEffect, useState } from "react";
import SidebarWithHeader from "./common/components/InventoryControllerSidebarWithHeader.jsx";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

export default function InventoryStocks() {
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState([]);
  const [form, setForm] = useState({
    productId: "",
    beginningStock: "",
    week1: "",
    week2: "",
    week3: "",
    week4: "",
    endingStock: "",
  });

  useEffect(() => {
    async function fetchStocks() {
      try {
        const q = query(collection(db, "stocks"), orderBy("periodStart", "desc"));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStocks(data);
      } catch (err) {
        console.error("Error fetching stocks:", err);
      }
      setLoading(false);
    }
    fetchStocks();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "stocks"), {
        productId: form.productId,
        beginningStock: Number(form.beginningStock),
        week1: Number(form.week1),
        week2: Number(form.week2),
        week3: Number(form.week3),
        week4: Number(form.week4),
        endingStock: Number(form.endingStock),
        periodStart: Timestamp.now(),
        createdAt: Timestamp.now(),
      });
      setForm({
        productId: "",
        beginningStock: "",
        week1: "",
        week2: "",
        week3: "",
        week4: "",
        endingStock: "",
      });
      alert("✅ Stock entry added successfully!");
    } catch (err) {
      console.error("Error adding stock:", err);
    }
  };

  return (
    <SidebarWithHeader pageTitle="Inventory Stocks">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#160B53]">Inventory Stocks</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#160B53] hover:opacity-90 text-white flex items-center gap-2">
                <PlusCircle size={18} />
                Add Stock Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Weekly Stock Record</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-3">
                <Input
                  type="text"
                  name="productId"
                  placeholder="Product ID"
                  value={form.productId}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="number"
                  name="beginningStock"
                  placeholder="Beginning Stock"
                  value={form.beginningStock}
                  onChange={handleChange}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    name="week1"
                    placeholder="Week 1"
                    value={form.week1}
                    onChange={handleChange}
                  />
                  <Input
                    type="number"
                    name="week2"
                    placeholder="Week 2"
                    value={form.week2}
                    onChange={handleChange}
                  />
                  <Input
                    type="number"
                    name="week3"
                    placeholder="Week 3"
                    value={form.week3}
                    onChange={handleChange}
                  />
                  <Input
                    type="number"
                    name="week4"
                    placeholder="Week 4"
                    value={form.week4}
                    onChange={handleChange}
                  />
                </div>
                <Input
                  type="number"
                  name="endingStock"
                  placeholder="Ending Stock"
                  value={form.endingStock}
                  onChange={handleChange}
                />
                <Button type="submit" className="bg-[#160B53] text-white mt-2">
                  Save Stock
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stock History */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-[#160B53]">Stock History</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <p className="p-4 text-gray-500">Loading...</p>
            ) : stocks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Beginning</TableHead>
                    <TableHead>Week 1</TableHead>
                    <TableHead>Week 2</TableHead>
                    <TableHead>Week 3</TableHead>
                    <TableHead>Week 4</TableHead>
                    <TableHead>Ending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((s) => (
                    <TableRow key={s.id} className="hover:bg-gray-50">
                      <TableCell>
                        {s.periodStart?.toDate().toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">{s.productId}</TableCell>
                      <TableCell>{s.beginningStock ?? 0}</TableCell>
                      <TableCell>{s.week1 ?? 0}</TableCell>
                      <TableCell>{s.week2 ?? 0}</TableCell>
                      <TableCell>{s.week3 ?? 0}</TableCell>
                      <TableCell>{s.week4 ?? 0}</TableCell>
                      <TableCell className="font-semibold">
                        {s.endingStock ?? 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center text-gray-500">
                📦 No stock history found.  
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarWithHeader>
  );
}
