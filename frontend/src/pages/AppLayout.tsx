import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import styles from './AppLayout.module.css'; // Assuming styles are moved or created here

// You can use an icon library like lucide-react for a professional look
// Run: npm install lucide-react
// import { UtensilsCrossed, Users, UserPlus, LogOut } from 'lucide-react';

const Icon = ({ name }: { name: string }) => <span style={{ marginRight: '10px' }}>{name.slice(0, 1)}</span>;

export default function AppLayout() {
  const { user, subscription, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // The ProtectedRoute already ensures the user exists, but this is a good safeguard.
  if (!user) {
    return <div>Loading user session...</div>; // Or a spinner component
  }

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3>Nandeyal POS</h3>
        </div>
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
            <Icon name="Tables" />
            <span>Tables</span>
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
            <Icon name="Menu" />
            <span>Menu</span>
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
            <Icon name="Orders" />
            <span>Orders</span>
          </NavLink>
          {/* Feature Gate for Inventory - Note: subscription structure might differ */}
          {subscription?.status === 'active' && ( // Example check
            <NavLink to="/inventory" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
              <Icon name="Inventory" />
              <span>Inventory</span>
            </NavLink>
          )}
          <NavLink to="/customers" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
            <Icon name="Customers" />
            <span>Customers</span>
          </NavLink>

          {/* Role-based links for Admins */}
          {(user.role === 'OWNER' || user.role === 'MANAGER') && (
            <>
              <NavLink to="/users" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
                <Icon name="Users" />
                <span>User Management</span>
              </NavLink>
              <NavLink to="/settings" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
                <Icon name="Settings" />
                <span>Settings</span>
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