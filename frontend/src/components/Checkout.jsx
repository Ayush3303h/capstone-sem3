// src/components/Checkout.jsx
import { useEffect, useState, useRef } from "react";
import { apiGet } from "../api";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import socket from "../socket";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { restaurantSlug: paramSlug } = useParams();
  const orderId = location.state?.orderId;
  const restaurantSlug = paramSlug || "default";

  const [order, setOrder] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const audioRef = useRef(null);
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => { audioRef.current = new Audio("https://jmp.sh/miX8tm8e"); audioRef.current.volume = 0.8; }, []);

  useEffect(() => {
    if (!orderId) return;
    let mounted = true;
    (async () => {
      try {
        const rest = await apiGet(`/restaurants/${restaurantSlug}`);
        if (!mounted) return;
        setRestaurantId(rest._id);
        const o = await apiGet(`/restaurants/${restaurantSlug}/orders/${orderId}`);
        if (!mounted) return;
        setOrder(o);
      } catch (err) { console.error(err); }
    })();
    return () => { mounted = false; };
  }, [orderId, restaurantSlug]);

  useEffect(() => {
    if (!restaurantId || !orderId) return;
    socket.connect();
    socket.emit("join", { restaurantId });
    const onUpdated = (updated) => { if (updated._id === orderId) setOrder(updated); };
    socket.on("order:updated", onUpdated);
    return () => { socket.off("order:updated", onUpdated); socket.disconnect(); };
  }, [restaurantId, orderId]);

  useEffect(() => {
    if (!order || order.status !== "approved") return;
    const getStartTime = () => (order.startTime ? new Date(order.startTime) : null);
    const updateRemaining = () => {
      const start = getStartTime();
      if (!start || !order.completionTime) return;
      const endTime = start.getTime() + order.completionTime * 60 * 1000;
      const diff = endTime - Date.now();
      setRemaining(diff > 0 ? diff : 0);
      if (diff <= 0 && audioRef.current) audioRef.current.play().catch(()=>{});
    };
    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const formatTime = (ms) => {
    if (ms === null) return "00:00";
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const progressPercent = () => {
    if (!order || !order.startTime || !order.completionTime) return 0;
    const start = new Date(order.startTime);
    const duration = order.completionTime * 60 * 1000;
    const elapsed = Date.now() - start.getTime();
    return Math.min((elapsed / duration) * 100, 100);
  };

  if (!orderId) return <p className="text-center text-red-500 mt-20">No order found.</p>;
  if (!order) return <p className="text-center text-gray-500 mt-20">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto my-12 p-4 space-y-8">
      <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-800 font-medium mb-4 transition">← Back</button>
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Order Receipt</h1>
        <p className="text-gray-500 mt-1">Table: {order.tableId || "N/A"}</p>
        <p className="text-gray-400 text-sm mt-1">Order ID: {orderId}</p>
      </div>

      <motion.div className="bg-white rounded-2xl shadow-xl p-6 space-y-4 border border-gray-100" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {order.items?.map((item, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="flex items-center justify-between gap-4 p-3 border-b border-gray-100 rounded-lg hover:bg-gray-50">
            <img src={item.imageURL || "/placeholder.jpg"} alt={item.name} className="w-16 h-16 object-cover rounded-xl shadow-sm" />
            <div className="flex-1 flex flex-col justify-center">
              <p className="font-medium text-gray-800">{item.name}</p>
              <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
              {item.modifiers?.[0]?.option?.price && <p className="text-gray-400 text-xs">Modifier: +₹{item.modifiers[0].option.price}</p>}
            </div>
            <span className="font-semibold text-gray-900">₹{((item.price ?? 0) * item.quantity).toFixed(2)}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 space-y-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.subtotal?.toFixed(2)}</span></div>
        <div className="flex justify-between text-gray-600"><span>Service Fee (5%)</span><span>₹{order.tax?.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-200 pt-2"><span>Total</span><span>₹{order.total?.toFixed(2)}</span></div>
      </motion.div>

      {order.status === "approved" && remaining !== null && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="relative w-48 h-48 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="90" stroke="#e5e7eb" strokeWidth="12" fill="transparent" />
            <circle cx="96" cy="96" r="90" stroke="#4f46e5" strokeWidth="12" fill="transparent" strokeDasharray={565.48} strokeDashoffset={565.48 * (1 - progressPercent() / 100)} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col justify-center items-center">
            <p className="text-xl text-gray-600">⏱️ Remaining</p>
            <p className="text-2xl font-bold text-indigo-600">{formatTime(remaining)}</p>
          </div>
        </motion.div>
      )}

      {order.status !== "approved" && (
        <motion.div className="bg-white rounded-2xl shadow-xl p-6 text-center border border-gray-100" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          {order.status === "pending" && <p className="text-gray-600 font-medium">⏳ Your order is being reviewed...</p>}
          {order.status === "completed" && <p className="text-blue-600 font-semibold text-xl">✅ Enjoy your meal!</p>}
          {order.status === "rejected" && <p className="text-red-600 font-medium">❌ Sorry, your order was rejected.</p>}
        </motion.div>
      )}
    </div>
  );
}
