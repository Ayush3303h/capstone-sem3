// src/helpers/fetchMenu.js
import { apiGet } from "../api";
export async function fetchMenu(restaurantSlug = "default") {
  if (!restaurantSlug) throw new Error("restaurantSlug required");
  return apiGet(`/restaurants/${restaurantSlug}/menu`);
}
