// App.jsx — Fixed & Polished
// Works perfectly with your Node + MongoDB backend on port 3000

import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
console.log("✅ API Base URL:", API);

function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      const t = localStorage.getItem("user");
      return t ? JSON.parse(t) : null;
    } catch {
      return null;
    }
  });

  const save = (tokenValue, userObj) => {
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("user", JSON.stringify(userObj || {}));
    setToken(tokenValue);
    setUser(userObj);
  };
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };
  return { token, user, save, logout };
}

export default function App() {
  const { token, user, save, logout } = useAuth();
  const [view, setView] = useState("login");

  useEffect(() => {
    if (token) setView("dashboard");
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-indigo-800 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-gradient-to-br from-white/6 to-white/3 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-6">
        <Header
          user={user}
          onLogout={logout}
          onSwitch={(v) => setView(v)}
          currentView={view}
        />
        <main className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="p-6">
              <Hero />
              <Features />
            </div>

            <div className="p-6">
              {view === "login" && (
                <AuthBox
                  mode="login"
                  onSuccess={(tok, u) => save(tok, u)}
                  switchToRegister={() => setView("register")}
                />
              )}
              {view === "register" && (
                <AuthBox
                  mode="register"
                  onSuccess={() => setView("login")}
                  switchToLogin={() => setView("login")}
                />
              )}
              {view === "dashboard" && (
                <Dashboard token={token} user={user} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ---------------- Header ----------------
function Header({ user, onLogout, onSwitch, currentView }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 rounded-xl flex items-center justify-center text-white font-bold shadow-lg transform -rotate-6">
          RA
        </div>
        <div>
          <h1 className="text-white text-2xl font-extrabold tracking-tight">
            Restaurant Admin
          </h1>
          <p className="text-indigo-200 text-sm">
            Beautiful, fast admin for your restaurant
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!user && (
          <>
            <NavButton
              active={currentView === "login"}
              onClick={() => onSwitch("login")}
            >
              Login
            </NavButton>
            <NavButton
              active={currentView === "register"}
              onClick={() => onSwitch("register")}
            >
              Register
            </NavButton>
          </>
        )}
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-indigo-100">
              Hello, <strong>{user.name || user.email}</strong>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm shadow hover:bg-red-500 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NavButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-shadow duration-300 ${
        active
          ? "bg-white/10 text-white shadow-lg"
          : "text-indigo-100 hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

// ---------------- Hero + Features ----------------
function Hero() {
  return (
    <div className="mb-6">
      <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
        Manage your restaurant with style ✨
      </h2>
      <p className="mt-3 text-indigo-200 max-w-xl">
        Fast auth, secure JWT, and a smooth interface — everything you need to
        manage menus, orders, and tables.
      </p>
      <div className="mt-6 flex gap-3">
        <button className="px-5 py-2 bg-emerald-500 text-white rounded-lg shadow-lg hover:scale-105 transform transition">
          Get started
        </button>
        <button className="px-5 py-2 border border-white/10 text-white rounded-lg hover:bg-white/5 transition">
          Learn more
        </button>
      </div>
    </div>
  );
}

function Features() {
  const items = [
    { title: "Secure Authentication", desc: "JWT-based auth and protected routes." },
    { title: "Fast Development", desc: "Vite + React + Tailwind for rapid UI dev." },
    { title: "Atlas Ready", desc: "Works with MongoDB Atlas out of the box." },
  ];
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((it, idx) => (
        <div
          key={idx}
          className="p-4 bg-white/5 border border-white/6 rounded-xl hover:scale-105 transform transition duration-300"
        >
          <h4 className="text-white font-semibold">{it.title}</h4>
          <p className="text-indigo-200 text-sm mt-1">{it.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------- Auth Box ----------------
function AuthBox({ mode, onSuccess, switchToRegister, switchToLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    gender: "male",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const safeJson = async (res) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { message: text || "Invalid response" };
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch(`${API}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            gender: form.gender,
          }),
        });
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data.message || "Register failed");
        switchToLogin && switchToLogin();
      } else {
        const res = await fetch(`${API}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data.message || "Login failed");
        const token = data.token;
        const payload = JSON.parse(atob(token.split(".")[1]));
        onSuccess && onSuccess(token, { name: payload.name, email: payload.email });
      }
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white/3 to-white/5 p-6 rounded-xl shadow-md border border-white/6">
      <h2 className="text-lg font-semibold text-white mb-4">
        {mode === "register" ? "Create an account" : "Sign in to your account"}
      </h2>
      <form onSubmit={submit} className="space-y-4">
        {mode === "register" && (
          <>
            <input
              name="name"
              value={form.name}
              onChange={handle}
              placeholder="Full name"
              required
              className="w-full p-3 rounded-lg bg-transparent border border-white/8 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <select
              name="gender"
              value={form.gender}
              onChange={handle}
              className="w-full p-3 rounded-lg bg-transparent border border-white/8 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </>
        )}

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handle}
          placeholder="Email"
          required
          className="w-full p-3 rounded-lg bg-transparent border border-white/8 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handle}
          placeholder="Password"
          required
          className="w-full p-3 rounded-lg bg-transparent border border-white/8 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />

        {error && <div className="text-sm text-red-400">{error}</div>}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-indigo-500 text-white rounded-lg shadow hover:scale-105 transform transition"
          >
            {loading
              ? "Please wait..."
              : mode === "register"
              ? "Create account"
              : "Sign in"}
          </button>
          {mode === "login" ? (
            <button
              type="button"
              onClick={switchToRegister}
              className="text-sm text-indigo-200"
            >
              Create account
            </button>
          ) : (
            <button
              type="button"
              onClick={switchToLogin}
              className="text-sm text-indigo-200"
            >
              Back to login
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ---------------- Dashboard ----------------
function Dashboard({ token, user }) {
  const [message, setMessage] = useState("Loading...");
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed");
        setMessage(data.message);
      } catch (err) {
        setMessage(err.message || "Error");
      }
    })();
  }, [token]);

  return (
    <div className="p-4 bg-white/4 rounded-xl border border-white/6">
      <h3 className="text-white text-lg font-semibold">Dashboard</h3>
      <p className="mt-2 text-indigo-200">{message}</p>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Profile">
          <p className="text-sm text-indigo-100">
            <strong>Name:</strong> {user?.name || "-"}
          </p>
          <p className="text-sm text-indigo-100">
            <strong>Email:</strong> {user?.email || "-"}
          </p>
        </Card>

        <Card title="Quick Actions">
          <p className="text-sm text-indigo-100">
            Add menu management, orders, QR generator, and more here.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="p-4 bg-gradient-to-br from-white/4 to-white/6 border border-white/6 rounded-xl shadow-sm transform transition hover:scale-105">
      <h4 className="text-white font-medium mb-2">{title}</h4>
      <div className="text-sm text-indigo-200">{children}</div>
    </div>
  );
}
