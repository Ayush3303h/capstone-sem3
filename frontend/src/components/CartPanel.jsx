// src/components/CartPanel.jsx
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { apiPost } from "../api";

export default function CartPanel({ onClose, tableId, restaurantSlug: propSlug }) {
  const { restaurantSlug: paramSlug } = useParams();
  const restaurantSlug = propSlug || paramSlug || "default";

  const { cart, incrementItem, decrementItem, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + ((item?.modifiers?.[0]?.option?.price ?? item?.price ?? 0) * (item?.quantity || 0)),
    0
  );
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    try {
      const payload = { items: cart, subtotal, tax, total, status: "pending", tableId: tableId || null };
      const resp = await apiPost(`/restaurants/${restaurantSlug}/orders`, payload);
      navigate(`/${restaurantSlug}/checkout`, { state: { orderId: resp.orderId } });
      onClose?.();
      clearCart();
    } catch (err) {
      console.error("place order error", err);
      alert("Failed to place order");
    }
  };

  return (
    <AnimatePresence>
      {cart && (
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.3 }} className="absolute right-4 top-16 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-5 z-40">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Your Cart</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          {cart.length === 0 ? <div className="text-center text-gray-500 py-6">Your cart is empty</div> : (
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => {
                const price = item?.modifiers?.[0]?.option?.price ?? item?.price ?? 0;
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 border-b border-gray-100 pb-2 rounded-md p-1">
                    <img src={item.imageURL || "/placeholder.jpg"} alt={item.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">₹{price}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => decrementItem(item.id)} className="w-6 h-6 rounded bg-gray-100">−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => incrementItem(item.id)} className="w-6 h-6 rounded bg-gray-100">+</button>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 ml-1">×</button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {cart.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Service fee (5%)</span><span>₹{tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-gray-800"><span>Total</span><span>₹{total.toFixed(2)}</span></div>

              <button onClick={handlePlaceOrder} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md py-2">Place Order</button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
