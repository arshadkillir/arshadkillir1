import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './AppShell.module.css';

// You can use an icon library like lucide-react for a professional look
// Run: npm install lucide-react
// import { UtensilsCrossed, Users, UserPlus, LogOut } from 'lucide-react';

const Icon = ({ name }) => <span style={{ marginRight: '10px' }}>{name.slice(0, 1)}</span>;

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // A simple check in case the shell is rendered without a user
  if (!user) {
    return null; 
  }

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3>Nandeyal POS</h3>
        </div>
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            <Icon name="Tables" />
            <span>Tables</span>
          </NavLink>
          <NavLink to="menu" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            <Icon name="Menu" />
            <span>Menu</span>
          </NavLink>
          <NavLink to="orders" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            <Icon name="Orders" />
            <span>Orders</span>
          </NavLink>
          <NavLink to="inventory" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            <Icon name="Inventory" />
            <span>Inventory</span>
          </NavLink>
          <NavLink to="customers" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
            <Icon name="Customers" />
            <span>Customers</span>
          </NavLink>
          
          {/* Role-based links for Admins */}
          {(user.role === 'OWNER' || user.role === 'SUPERADMIN' || user.role === 'MANAGER') && (
            <>
              <NavLink to="users" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                <Icon name="Users" />
                <span>User Management</span>
              </NavLink>
              <NavLink to="register" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                <Icon name="Register" />
                <span>Register User</span>
              </NavLink>
              <NavLink to="menu-management" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                <Icon name="Menu" />
                <span>Menu Management</span>
              </NavLink>
            </>
          )}
        </nav>
        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={`${styles.link} ${styles.logoutButton}`}>
            <Icon name="Logout" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}