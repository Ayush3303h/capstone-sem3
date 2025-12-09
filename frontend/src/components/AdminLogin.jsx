import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { apiPost } from "../api";
import { setToken } from "../auth";
import { useNavigate, useParams } from "react-router-dom";

export default function AdminLogin() {
  const [error, setError] = useState("");
  const { restaurantSlug } = useParams();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    try {
      const id_token = credentialResponse.credential || credentialResponse;

      const resp = await apiPost("/auth/oauth/google", {
        id_token,
        restaurantSlug,
      });

      if (resp?.token) {
        // Save JWT
        setToken(resp.token);

        // ✅ Force a full reload on the admin route
        // This fixes the "have to refresh manually" issue
        window.location.href = `/${restaurantSlug}/admin`;
        // (If you later have a /admin/dashboard route, change the URL accordingly)
      } else {
        setError("Login failed");
      }
    } catch (err) {
      console.error("Google sign-in error:", err);

      // Try to read server error (e.g. "You are not an admin for this restaurant")
      const msg =
        err?.response?.data?.error ||
        (err?.response?.status === 403
          ? "You are not an admin for this restaurant"
          : "Login failed");

      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-80 sm:w-96 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Admin Login
        </h1>

        {error && (
          <p className="text-red-500 text-sm text-center whitespace-pre-line">
            {error}
          </p>
        )}

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google sign-in failed")}
          />
        </div>

        <p className="text-sm text-center text-gray-500">
          Sign in with an admin Google account
        </p>
      </div>
    </div>
  );
}