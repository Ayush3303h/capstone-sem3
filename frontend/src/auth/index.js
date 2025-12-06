// // src/auth/index.js
// export const TOKEN_KEY = "qrAuthToken";

// export function setToken(token) {
//   if (!token) return;
//   localStorage.setItem(TOKEN_KEY, token);
// }

// export function getToken() {
//   return localStorage.getItem(TOKEN_KEY);
// }

// export function clearToken() {
//   localStorage.removeItem(TOKEN_KEY);
// }

// export function decodeToken(token) {
//   try {
//     const parts = token.split(".");
//     if (parts.length < 2) return null;
//     const payload = parts[1];
//     const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
//     return JSON.parse(decodeURIComponent(escape(json)));
//   } catch (e) {
//     return null;
//   }
// }


// frontend/src/auth/index.js

const TOKEN_KEY = "qrAuthToken";

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.error("Failed to save token", err);
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (err) {
    console.error("Failed to read token", err);
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error("Failed to clear token", err);
  }
}

// Lightweight JWT decode just for reading payload (no verification)
export function decodeToken() {
  const token = getToken();
  if (!token) return null;

  try {
    const [, payloadBase64] = token.split(".");
    const json = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
}
