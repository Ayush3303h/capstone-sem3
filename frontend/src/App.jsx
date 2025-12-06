// // src/App.jsx
// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import MenuList from "./components/MenuList";
// import Checkout from "./components/Checkout";
// import AdminLogin from "./components/AdminLogin";
// import AdminDashboard from "./components/AdminDashboard";
// import Navbar from "./components/Navbar";
// import QRTableDetector from "./components/QRTableDetector";

// export default function App() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <main className="max-w-7xl mx-auto">
//         <Routes>
//           <Route path="/:restaurantSlug/checkout" element={<Checkout />} />
//           <Route path="/:restaurantSlug/admin" element={<AdminLogin />} />
//           <Route path="/:restaurantSlug/admin/dashboard" element={<AdminDashboard />} />
//           <Route path="/:restaurantSlug/qr" element={<QRTableDetector />} />
//           <Route path="/:restaurantSlug" element={<MenuList />} />
//           <Route path="/" element={<MenuList />} />
//         </Routes>
//       </main>
//     </div>
//   );
// }

// src/App.jsx
import { Routes, Route } from "react-router-dom";
import MenuList from "./components/MenuList";
import Checkout from "./components/Checkout";
import QRTableDetector from "./components/QRTableDetector";
import AdminDashboard from "./components/AdminDashboard";
import Navbar from "./components/Navbar";
import { motion } from "framer-motion";
import HeroFood from "./Gemini_Generated_Image_sqiaposqiaposqia.png";

import "./index.css"; // Tailwind build

function GuestExperience() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50 to-gray-100">
      <Navbar />

      <main className="flex-1 px-[clamp(1rem,5vw,4rem)] py-12 flex flex-col gap-12">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-12 items-center bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-[24px] p-[clamp(2rem,5vw,3rem)] shadow-xl"
        >
          <div>
            <motion.span className="inline-flex items-center gap-2 uppercase text-xs tracking-wider bg-orange-100 text-orange-600 px-4 py-2 rounded-full mb-2 font-medium shadow-sm">
              Smart Dining
            </motion.span>
            <motion.h1 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-tight text-gray-900">
              Order delicious food right from your table
            </motion.h1>
            <motion.p className="mt-4 text-gray-600 max-w-[36ch]">
              Scan the QR code, explore our curated menu, and place your order
              seamlessly.
            </motion.p>
          </div>

          <motion.div className="w-full flex justify-center">
            <img
              src={HeroFood}
              alt="Delicious Food"
              className="w-full max-w-sm rounded-2xl shadow-2xl object-cover"
            />
          </motion.div>
        </motion.section>

        <section className="flex flex-col gap-6">
          <QRTableDetector />
          <motion.div>
            <MenuList />
          </motion.div>
        </section>
      </main>

      <footer className="text-center py-6 text-gray-400 text-sm">
        © {new Date().getFullYear()} Streake Dining ✨
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Guest experience page with hero + QR scanner + menu */}
      <Route path="/:restaurantSlug" element={<GuestExperience />} />

      {/* Checkout page for a specific restaurant */}
      <Route path="/:restaurantSlug/checkout" element={<Checkout />} />

      {/* Admin dashboard (has its own layout) */}
      <Route path="/:restaurantSlug/admin" element={<AdminDashboard />} />
    </Routes>
  );
}
