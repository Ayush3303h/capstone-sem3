// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import { GoogleOAuthProvider } from '@react-oauth/google';

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )




// // src/main.jsx
// import React from "react";
// import { createRoot } from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import { GoogleOAuthProvider } from "@react-oauth/google";

// import App from "./App";
// import { CartProvider } from "./context/CartContext";

// import "./index.css"; // your global styles (already present)
// import "./App.css";   // if you use App.css too

// const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";


// createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <GoogleOAuthProvider clientId={clientId}>
//       <BrowserRouter>
//         <CartProvider>
//           <App />
//         </CartProvider>
//       </BrowserRouter>
//     </GoogleOAuthProvider>
//   </React.StrictMode>
// );





// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import { CartProvider } from "./context/CartContext";

import "./index.css";
import "./App.css";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
