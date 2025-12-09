import { apiPut } from "../api";
export async function updateOrderStatus(restaurantSlug, orderId, data) {
  return apiPut(`/restaurants/${restaurantSlug}/orders/${orderId}/status`, data);
}
