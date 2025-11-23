import { Routes, Route } from 'react-router-dom';

// Import your route protection components
import { ProtectedRoute, RoleBasedRoute } from '@/components/ProtectedRoute';

// Import a layout component for authenticated users
import AppLayout from '@/pages/AppLayout';

// Import your page components
import LoginPage from '@/pages/Login';
import DashboardPage from '@/pages/Dashboard';
import UserManagementPage from '@/pages/UserManagement';
import TablesPage from '@/pages/Tables';
import OrdersPage from '@/pages/Orders';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import NotFoundPage from '@/pages/NotFoundPage';
import RegisterTenantPage from '@/pages/RegisterTenantPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';

function App() {
  return (
    <Routes>
      {/* === Public Routes === */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/register-tenant" element={<RegisterTenantPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* === Protected Routes (for any logged-in user) === */}
      {/* All routes inside here require a user to be logged in */}
      <Route element={<ProtectedRoute />}>
        {/* All routes inside here will share the AppLayout (sidebar, navbar, etc.) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tables" element={<TablesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          {/* Add other general pages like Menu, Inventory, Customers here */}

          {/* Role-Based routes are nested inside the main protected layout */}
          <Route element={<RoleBasedRoute allowedRoles={['OWNER', 'MANAGER']} />}>
            <Route path="/users" element={<UserManagementPage />} />
            {/* Add other OWNER/MANAGER-only routes here, e.g., /reports */}
          </Route>
        </Route>
      </Route>

      {/* === Catch-all for 404 Not Found === */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;