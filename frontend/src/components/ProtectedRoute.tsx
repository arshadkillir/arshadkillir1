import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/context/AuthContext";

interface RoleBasedRouteProps {
  allowedRoles: User["role"][];
}

/**
 * ✅ Protects routes that require authentication.
 * Redirects to /login if no token.
 * Shows a loading state while user is being decoded.
 */
export const ProtectedRoute = () => {
  const { user, token } = useAuth();
  const location = useLocation();

  // ✅ No token → not authenticated → redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Token exists but user not decoded yet (page refresh)
  if (!user) {
    return <div>Loading user session...</div>;
  }

  return <Outlet />;
};

/**
 * ✅ Protects routes based on user roles.
 * Requires user to be authenticated AND have the correct role.
 */
export const RoleBasedRoute = ({ allowedRoles }: RoleBasedRouteProps) => {
  const { user, token } = useAuth();

  // ✅ Not logged in at all
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Token exists but user not decoded yet
  if (!user) {
    return <div>Loading user session...</div>;
  }

  // ✅ User logged in but role not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
