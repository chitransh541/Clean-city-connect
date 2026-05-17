import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

/**
 * ProtectedRoute – Guards routes that require authentication.
 * 
 * Props:
 *  - children: the protected page component
 *  - role: optional role restriction ('officer')
 */
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    toast.error('Please login to access this page', { id: 'auth-required' });
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    toast.error('You do not have permission to access this page', { id: 'role-required' });
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
