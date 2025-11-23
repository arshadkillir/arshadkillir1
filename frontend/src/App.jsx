﻿﻿﻿import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext.jsx'; // Make sure this is imported
import RequireAuth from './context/RequireAuth.jsx'; // Make sure this is imported
import AppShell from './pages/AppShell.jsx'; // Make sure this is imported

import Login from "./pages/Login.jsx";
import Orders from "./pages/Orders.jsx";
import Tables from "./pages/Tables.jsx";
import Menu from "./pages/Menu.jsx"; // This is now the read-only menu
import Inventory from "./pages/Inventory.jsx";
import Customers from "./pages/Customers.jsx"; // Corrected import path
import UserManagement from './pages/UserManagement.jsx'; // Make sure this is imported
import RegisterUser from './pages/RegisterUser.jsx'; // Make sure this is imported
import MenuManagement from './pages/MenuManagement.jsx'; // This is the renamed management component
import Bill from './pages/Bill.jsx'; // Make sure this is imported

export default function App(){
  return (
    <AuthProvider> {/* AuthProvider must wrap your entire application */}
      <Routes future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/bill/:tableUuid" element={<Bill />} /> {/* Public bill access via QR */}

        {/* Protected Routes wrapped by AppShell and RequireAuth */}
        <Route 
          path="/" 
          element={<RequireAuth><AppShell /></RequireAuth>}
        >
          <Route index element={<Tables />} /> {/* Default page after login */}
          <Route path="orders" element={<Orders />} />
          <Route path="menu" element={<Menu />} />
          <Route path="menu-management" element={<MenuManagement />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="customers" element={<Customers />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="register" element={<RegisterUser />} />
        </Route>

        {/* Fallback for unmatched routes */}
        <Route path="*" element={<div style={{ padding: 20 }}>404 - Page Not Found</div>} />
      </Routes>
    </AuthProvider>
  );
}
