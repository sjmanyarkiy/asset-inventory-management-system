import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';

/**
 * Custom hook to check user permissions and roles
 * Usage: const { isAdmin, isSuperAdmin, hasPermission } = usePermissions();
 */
export const usePermissions = () => {
  const user = useSelector(selectUser);

  // Check if user is admin (hierarchy_level <= 1)
  const isAdmin = () => {
    return user && user.role && user.role.hierarchy_level <= 1;
  };

  // Check if user is super admin (hierarchy_level === 0)
  const isSuperAdmin = () => {
    return user && user.role && user.role.hierarchy_level === 0;
  };

  // Check if user is manager (hierarchy_level <= 2)
  const isManager = () => {
    return user && user.role && user.role.hierarchy_level <= 2;
  };

  // Check specific permission
  const hasPermission = (permissionName) => {
    if (!user || !user.role || !user.role.permissions) {
      return false;
    }
    return user.role.permissions[permissionName] === true;
  };

  // Get user's role name
  const getRoleName = () => {
    return user?.role?.name || 'Unknown';
  };

  // Get user's hierarchy level
  const getHierarchyLevel = () => {
    return user?.role?.hierarchy_level ?? 999;
  };

  return {
    isAdmin,
    isSuperAdmin,
    isManager,
    hasPermission,
    getRoleName,
    getHierarchyLevel,
    user
  };
};

/**
 * Hook to check if current user can perform admin actions
 */
export const useAdminAccess = () => {
  const { isAdmin, isSuperAdmin } = usePermissions();

  return {
    canAccessAdminPanel: isAdmin(),
    canManageUsers: isAdmin(),
    canManageRoles: isSuperAdmin(),
    canViewAuditLogs: isAdmin()
  };
};