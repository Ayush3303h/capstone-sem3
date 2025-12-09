import axios from "axios";
import { getToken } from "../auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:4000/api/v1",
});

// attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export async function apiGet(path, config = {}) {
  const res = await api.get(path, config);
  return res.data;
}

export async function apiPost(path, data = {}, config = {}) {
  const res = await api.post(path, data, config);
  return res.data;
}

export async function apiPut(path, data = {}, config = {}) {
  const res = await api.put(path, data, config);
  return res.data;
}

export async function apiDelete(path, config = {}) {
  const res = await api.delete(path, config);
  return res.data;
}

export default api;