// src/components/Cart.jsx
import React from "react";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, incrementItem, decrementItem, removeFromCart } = useCart();

  if (!cart.length) return <div className="p-4 text-gray-500">Cart is empty</div>;
  return (
    <div className="space-y-3 p-4">
      {cart.map(item => (
        <div key={item.id} className="flex justify-between items-center">
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => decrementItem(item.id)} className="px-2">-</button>
            <button onClick={() => incrementItem(item.id)} className="px-2">+</button>
            <button onClick={() => removeFromCart(item.id)} className="text-red-500 px-2">Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
}
