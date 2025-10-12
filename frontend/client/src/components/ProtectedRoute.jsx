import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Usage:
// <ProtectedRoute roles={["user"]} redirectTo="/login"> <UserDashboard/> </ProtectedRoute>
// or as element in routes: element={<ProtectedRoute roles={["user"]} />} with children routes

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

export default function ProtectedRoute({ roles, redirectTo = '/login', children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    // Role mismatch: bounce to appropriate dashboard if possible
    const fallback = user.role === 'judge' ? '/judge-dashboard' : '/user-dashboard';
    return <Navigate to={fallback} replace />;
  }

  // Support both wrapper and outlet usage
  return children ? children : <Outlet />;
}





