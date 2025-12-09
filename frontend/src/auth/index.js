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