import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Forbidden from '../pages/shared/Forbidden';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: Array<'manager' | 'co_manager' | 'employee'>;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);
  const location = useLocation();

  if (!token) {
    if (location.pathname.includes('/employee')) {
      return <Navigate to="/login/employee" replace />;
    } else if (location.pathname.includes('/co-manager')) {
      return <Navigate to="/login/co-manager" replace />;
    }
    return <Navigate to="/login/manager" replace />;
  }

  if (roles && !user) {
    if (location.pathname.includes('/employee')) {
      return <Navigate to="/login/employee" replace />;
    } else if (location.pathname.includes('/co-manager')) {
      return <Navigate to="/login/co-manager" replace />;
    }
    return <Navigate to="/login/manager" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Forbidden />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
