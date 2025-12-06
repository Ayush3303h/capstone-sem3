// // src/api/index.js
// import axios from "axios";
// const baseURL = import.meta.env.VITE_API_BASE || "";

// const api = axios.create({
//   baseURL,
//   headers: { "Content-Type": "application/json" },
// });

// export default api;

// // helpers
// export async function apiGet(path, opts = {}) {
//   const res = await api.get(path, opts);
//   return res.data;
// }
// export async function apiPost(path, body, opts = {}) {
//   const res = await api.post(path, body, opts);
//   return res.data;
// }
// export async function apiPut(path, body, opts = {}) {
//   const res = await api.put(path, body, opts);
//   return res.data;
// }
// export async function apiDelete(path, opts = {}) {
//   const res = await api.delete(path, opts);
//   return res.data;
// }




// frontend/src/api/index.js
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
