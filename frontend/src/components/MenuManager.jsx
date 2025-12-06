// src/components/MenuManager.jsx
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { apiGet, apiPost } from "../api";
import { useParams } from "react-router-dom";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

export default function MenuManager({ restaurantSlug: propSlug }) {
  const { restaurantSlug: paramSlug } = useParams();
  const restaurantSlug = propSlug || paramSlug || "default";

  const [menu, setMenu] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "", imageURL: "", spicy: false, veg: true });
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);

  const fetchMenu = async () => {
    try {
      const data = await apiGet(`/restaurants/${restaurantSlug}/menu`);
      setMenu(data);
    } catch (err) { console.error("Failed to fetch menu:", err); }
  };

  useEffect(() => { if (restaurantSlug) fetchMenu(); }, [restaurantSlug]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price) || 0 };
      await apiPost(`/restaurants/${restaurantSlug}/menu`, payload);
      alert("✅ Menu item added!");
      setForm({ name: "", description: "", price: "", category: "", imageURL: "", spicy: false, veg: true });
      fetchMenu();
    } catch (err) { console.error(err); alert("Failed to add menu item."); }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const data = results.data;
        const items = data.filter(it => it.name && it.price).map(it => ({
          name: it.name.trim(),
          price: Number(it.price),
          category: it.category?.trim() || "",
          description: it.description?.trim() || "",
          imageURL: it.imageURL?.trim() || "",
          veg: it.veg?.toString().toLowerCase() === "true" || it.veg === "1",
          spicy: it.spicy?.toString().toLowerCase() === "true" || it.spicy === "1",
        }));
        try {
          await apiPost(`/restaurants/${restaurantSlug}/menu/bulk`, { items });
          alert(`✅ ${items.length} items uploaded successfully!`);
          fetchMenu();
        } catch (err) { console.error("CSV bulk insert failed", err); alert("CSV upload failed"); }
        setUploading(false);
      },
      error: (err) => { console.error("CSV parse error", err); setUploading(false); alert("Failed to read CSV"); }
    });
  };

  useEffect(() => {
    try { pdfjsLib.GlobalWorkerOptions.workerSrc = "//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.8.162/pdf.worker.min.js"; } catch (e) { console.warn("pdfjs worker setup issue:", e); }
  }, []);

  const fallbackParseLinesToItems = (text) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const items = [];
    for (const line of lines) {
      const priceMatch = line.match(/(?:₹|INR|\$)?\s*([0-9]+(?:[.,][0-9]{1,2})?)\s*$/);
      if (priceMatch) {
        const price = Number(priceMatch[1].replace(",", "."));
        const nameCat = line.slice(0, priceMatch.index).trim();
        let category = ""; let name = nameCat;
        if (nameCat.includes("-")) { const parts = nameCat.split("-"); category = parts[0].trim(); name = parts.slice(1).join("-").trim(); }
        items.push({ name, price, category, description: "" });
      }
    }
    return items;
  };

  const processFileForOCR = async (file) => {
    if (!file) return { text: "" };
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    let aggregatedText = "";
    if (isPdf) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const maxPages = Math.min(pdf.numPages, 5);
      for (let p = 1; p <= maxPages; p++) {
        const page = await pdf.getPage(p);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        const { data: { text } = {} } = await Tesseract.recognize(canvas, "eng", { logger: () => {} });
        aggregatedText += "\n" + (text || "");
      }
    } else {
      const imgURL = URL.createObjectURL(file);
      const { data: { text } = {} } = await Tesseract.recognize(imgURL, "eng", { logger: () => {} });
      URL.revokeObjectURL(imgURL);
      aggregatedText = text || "";
    }
    return { text: aggregatedText };
  };

  const handleAIUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    try {
      const { text: ocrText } = await processFileForOCR(file);
      let items = fallbackParseLinesToItems(ocrText);
      try {
        const fd = new FormData();
        fd.append("restaurantSlug", restaurantSlug);
        fd.append("ocrText", ocrText);
        fd.append("file", file);
        const resp = await fetch(`${import.meta.env.VITE_API_BASE}/restaurants/${restaurantSlug}/menu/enrich`, { method: "POST", body: fd });
        if (resp.ok) {
          const parsed = await resp.json();
          if (Array.isArray(parsed.items) && parsed.items.length > 0) items = parsed.items;
        } else { console.warn("Backend enrich failed:", resp.statusText); }
      } catch (backendErr) { console.warn("Backend enrich failed:", backendErr); }
      if (!items || items.length === 0) { alert("No items found in uploaded menu."); setParsing(false); e.target.value = ""; return; }
      if (!window.confirm(`Add ${items.length} items parsed from menu?`)) { setParsing(false); e.target.value = ""; return; }
      const resp = await apiPost(`/restaurants/${restaurantSlug}/menu/bulk`, { items });
      alert(`✅ ${items.length} items added.`);
      fetchMenu();
    } catch (err) { console.error("AI upload error:", err); alert("Failed to parse menu"); } finally { setParsing(false); e.target.value = ""; }
  };

  const handleDelete = async (id) => {
    try { await apiPost(`/restaurants/${restaurantSlug}/menu/${id}/delete`); setMenu(m => m.filter(i => i._id !== id)); } catch (err) { console.error(err); alert("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Add Menu Item</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="border p-2 rounded-md" />
          <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required className="border p-2 rounded-md" />
          <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} required className="border p-2 rounded-md" />
          <input name="imageURL" placeholder="Image URL" value={form.imageURL} onChange={handleChange} className="border p-2 rounded-md col-span-2" />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="border p-2 rounded-md col-span-2" />
          <label className="flex items-center gap-2"><input type="checkbox" name="veg" checked={form.veg} onChange={handleChange} /> Veg</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="spicy" checked={form.spicy} onChange={handleChange} /> Spicy</label>
          <button type="submit" className="bg-indigo-600 text-white py-2 rounded-md col-span-2">Add Item</button>
        </form>
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">Bulk Upload via CSV</h2>
        <input type="file" accept=".csv" onChange={handleCSVUpload} disabled={uploading} />
        <p className="text-sm text-gray-500 mt-2">CSV columns: name, price, category, description, imageURL, veg, spicy</p>
        {uploading && <p>Uploading...</p>}
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">Add via Menu Image / PDF (AI)</h2>
        <input type="file" accept="image/*,.pdf" onChange={handleAIUpload} disabled={parsing} />
        <p className="text-sm text-gray-500 mt-2">Upload a clear photo or PDF of your printed menu.</p>
        {parsing && <p className="mt-2">Processing... this can take a few seconds.</p>}
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Current Menu ({menu.length})</h3>
          <div className="flex gap-3">
            <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(menu)); alert("Copied"); }} className="bg-green-600 text-white px-4 py-2 rounded-md">Export JSON</button>
          </div>
        </div>
        <ul className="divide-y divide-gray-200">
          {menu.length > 0 ? menu.map(item => (
            <li key={item._id} className="py-3 flex justify-between items-center">
              <div><p className="font-medium">{item.name} - ₹{item.price}</p><p className="text-sm text-gray-500">{item.category}</p></div>
              <button onClick={() => handleDelete(item._id)} className="text-red-500">Remove</button>
            </li>
          )) : <p className="text-gray-500 text-center py-3">No menu items available.</p>}
        </ul>
      </div>
    </div>
  );
}
