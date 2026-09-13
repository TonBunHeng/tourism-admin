import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import authService, { normalizeRole, isFullAdminRole } from '../services/authService';
import Forbidden from '../pages/error/Forbidden';

/**
 * ProtectedRoute Guard
 * 
 * Enforces frontend authentication and role-based access.
 * Super Admin and Admin have full All Access to all protected routes.
 */
export default function ProtectedRoute({ allowedRoles = ['super_admin', 'admin', 'guide_editor', 'Super Admin', 'Admin', 'Guide / Editor', 'Tourism Content Editor'] }) {
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    isAllowedRole: false,
  });

  const checkRolePermission = (role) => {
    if (!role) return false;
    const userNorm = normalizeRole(role);
    // Super Admin gets Full All Access across the entire administrative portal
    if (userNorm === 'super_admin') return true;

    const normalizedAllowed = (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles])
      .map(r => normalizeRole(r));
    return normalizedAllowed.includes(userNorm);
  };

  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      const token = authService.getToken();
      if (!token) {
        if (isMounted) {
          setAuthStatus({ isAuthenticated: false, isAllowedRole: false });
          setIsVerifying(false);
        }
        return;
      }

      // Check current cached user first for quick responsiveness
      const currentUser = authService.getCurrentUser();
      if (currentUser?.role) {
        const isAllowed = checkRolePermission(currentUser.role);
        if (isMounted) {
          setAuthStatus({
            isAuthenticated: true,
            isAllowedRole: isAllowed,
          });
        }
      }

      try {
        // Authoritative server-side verification with backend
        const res = await authService.me();
        if (isMounted) {
          const user = res?.data?.user || res?.data;
          if (res?.success && user) {
            const isAllowed = checkRolePermission(user.role);
            setAuthStatus({
              isAuthenticated: true,
              isAllowedRole: isAllowed,
            });
          } else {
            authService.clearSession();
            setAuthStatus({ isAuthenticated: false, isAllowedRole: false });
          }
        }
      } catch (err) {
        if (isMounted) {
          if (!authService.getToken()) {
            setAuthStatus({ isAuthenticated: false, isAllowedRole: false });
          }
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    verifyAuth();

    const handleStorageChange = () => {
      if (!authService.getToken()) {
        setAuthStatus({ isAuthenticated: false, isAllowedRole: false });
        setIsVerifying(false);
      } else {
        const u = authService.getCurrentUser();
        if (u) {
          setAuthStatus({
            isAuthenticated: true,
            isAllowedRole: checkRolePermission(u.role),
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-profile-updated', handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-profile-updated', handleStorageChange);
    };
  }, [location.pathname, allowedRoles]);

  if (!authService.getToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isVerifying && !authStatus.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="w-7 h-7 text-[#003E83] dark:text-blue-500 animate-spin" />
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!authStatus.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!authStatus.isAllowedRole) {
    return <Forbidden />;
  }

  return <Outlet />;
}
