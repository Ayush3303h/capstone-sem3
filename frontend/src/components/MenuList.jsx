import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=640&q=80";

export default function MenuList() {
  const { restaurantSlug } = useParams();
  const [menu, setMenu] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const { cart, addToCart, incrementItem, decrementItem } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setStatus("loading");
        const data = await apiGet(`/restaurants/${restaurantSlug}/menu`);
        setMenu(data);
        setStatus("success");
      } catch (err) {
        setError(err?.message || String(err));
        setStatus("error");
      }
    };
    if (restaurantSlug) fetchMenu();
  }, [restaurantSlug]);

  const categories = useMemo(() => {
    const map = new Map();
    for (const it of menu) {
      const cat = (it.category || "Uncategorized").trim();
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(it);
    }
    return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
  }, [menu]);

  const [openMap, setOpenMap] = useState(() => Object.fromEntries(categories.map((c) => [c.name, false])));

  useEffect(() => {
    setOpenMap((prev) => {
      const next = {};
      for (const c of categories) next[c.name] = prev[c.name] ?? false;
      return next;
    });
  }, [categories]);

  const toggleCategory = (name) => setOpenMap((prev) => ({ ...prev, [name]: !prev[name] }));

  if (status === "loading") return <div className="p-6 text-center">Loading menu…</div>;
  if (status === "error") return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  if (!menu.length) return <div className="p-6 text-center text-gray-500">No menu items available.</div>;

  return (
    <section className="space-y-6 px-4 sm:px-6">
      <header className="pt-4 pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Menu</h1>
        <p className="text-sm text-gray-500 mt-1">Tap a category to expand — then add items to your cart.</p>
      </header>

      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button onClick={() => toggleCategory(cat.name)} className="w-full flex items-center justify-between gap-4 p-5 text-left focus:outline-none" aria-expanded={!!openMap[cat.name]}>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{cat.name}</h2>
                <div className="text-sm text-gray-500 mt-1">{cat.items.length} items</div>
              </div>
              <div className="flex items-center gap-3">
                <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${openMap[cat.name] ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
            <div className="border-t border-gray-100" />
            <div className={`${openMap[cat.name] ? "block" : "hidden"} divide-y divide-gray-100`}>
              {cat.items.map((item) => {
                const found = cart.find((c) => c.id === item._id || c.id === item.id);
                const qty = found ? found.quantity : 0;
                // Normalize id for cart usage
                const itemForCart = { ...item, id: item._id ?? item.id };
                return (
                  <motion.article key={item._id || item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.12 }} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start relative">
                    <div className="flex-1 min-w-0 pr-0 sm:pr-4">
                      <h3 className="font-medium text-gray-900 text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{item.description}</p>
                      <div className="mt-4 text-indigo-600 font-semibold">₹{item.price}</div>
                    </div>

                    <div className="w-full sm:w-32 flex-shrink-0 flex sm:flex-col items-start sm:items-end gap-2 sm:gap-0">
                      <div className="w-full sm:w-32 h-40 sm:h-24 bg-gray-50 rounded-lg overflow-hidden">
                        <img src={item.imageURL || FALLBACK_IMAGE} alt={item.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="w-full sm:w-auto flex justify-start sm:justify-end">
                        {qty === 0 ? (
                          <button onClick={() => addToCart(itemForCart)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm shadow">Add</button>
                        ) : (
                          <div className="flex items-center gap-2 bg-white p-1 rounded-md shadow">
                            <button onClick={() => decrementItem(itemForCart.id)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">−</button>
                            <span>{qty}</span>
                            <button onClick={() => incrementItem(itemForCart.id)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="h-12" />
    </section>
  );
}
