// src/components/Navbar.jsx
import { useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartPanel from "./CartPanel";
import { motion, AnimatePresence } from "framer-motion";
import api, { apiGet } from "../api";

import logoSrc from "../streake-logo.png";

export default function Navbar() {
  const { restaurantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table");
  const { cart } = useCart();
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleMyOrder = async () => {
    if (!tableId) return alert("No table detected");
    try {
      // backend endpoint returns array of orders
      const data = await apiGet(`/restaurants/${restaurantSlug}/orders?table=${tableId}&limit=1`);
      if (!data || data.length === 0) return alert("No order found");
      const orderId = data[0]._id;
      navigate(`/${restaurantSlug}/checkout`, { state: { orderId } });
    } catch (err) {
      console.error(err);
      alert("Failed to fetch order");
    }
  };

  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm z-30">
      <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="logo" className="w-10 h-10 rounded-md object-cover" />
          <strong className="text-indigo-600 text-xl font-bold">Streake</strong>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleMyOrder} className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-2xl shadow hover:bg-indigo-700">
            My Order
          </button>

          <button onClick={() => setShowCart(!showCart)} className="relative text-2xl hover:text-indigo-600" aria-label="Open cart">
            🛒
            {totalItems > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{totalItems}</span>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCart && <CartPanel onClose={() => setShowCart(false)} tableId={tableId} restaurantSlug={restaurantSlug} />}
      </AnimatePresence>
    </header>
  );
}
