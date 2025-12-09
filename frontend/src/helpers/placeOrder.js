import { apiPost } from "../api";

export async function placeOrder(restaurantSlug = "default", tableNumber, items) {
  if (!restaurantSlug) throw new Error("restaurantSlug required");
  const subtotal = items.reduce((s, it) => s + ((it?.modifiers?.[0]?.option?.price ?? it?.price ?? 0) * (it.quantity || 1)), 0);
  const payload = { tableId: tableNumber, items, subtotal, tax: subtotal * 0.05, total: subtotal * 1.05, status: "pending" };
  const resp = await apiPost(`/restaurants/${restaurantSlug}/orders`, payload);
  return resp.orderId;
}
