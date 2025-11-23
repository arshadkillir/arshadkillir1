import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import styles from "./Layout.module.css";

const navLinks = [
  { to: "/", label: "Dashboard", roles: ["ADMIN", "MANAGER"] },
  { to: "/orders", label: "Orders", roles: ["ADMIN", "MANAGER", "STAFF"] },
  { to: "/kds", label: "KDS", roles: ["ADMIN", "MANAGER", "STAFF"] },
  { to: "/tables", label: "Tables", roles: ["ADMIN", "MANAGER", "STAFF"] },
  { to: "/customers", label: "Customers", roles: ["ADMIN", "MANAGER", "STAFF"] },
  { to: "/menu", label: "Menu", roles: ["ADMIN", "MANAGER"] },
  { to: "/inventory", label: "Inventory", roles: ["ADMIN", "MANAGER"] },
  { to: "/purchases", label: "Purchases", roles: ["ADMIN", "MANAGER"] },
  { to: "/accounts/register", label: "Register User", roles: ["ADMIN"] },
  { to: "/accounts/manage", label: "Manage Users", roles: ["ADMIN"] },
  { to: "/profile", label: "My Profile", roles: ["ADMIN", "MANAGER", "STAFF"] },
  { to: "/integrations/account-aggregator", label: "Integrations", roles: ["ADMIN"] },
];

export default function Layout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { user } = useAuth();

  console.log("Layout rendered.");

  const accessibleNavLinks = navLinks.filter(link => 
    user?.role && link.roles.includes(user.role)
  );

  return (
    <div className={styles.layoutContainer}>
      <button 
        className={styles.hamburgerButton} 
        onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
        aria-label="Toggle navigation"
      >
        {/* Simple hamburger icon */}
        &#9776;
      </button>

      <aside className={`${styles.sidebar} ${isMobileNavOpen ? styles.open : ''}`}>
        <nav className={styles.sidebarNav}>
          {accessibleNavLinks.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              // Close mobile nav on link click
              onClick={() => setIsMobileNavOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
