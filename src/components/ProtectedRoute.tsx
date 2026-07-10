import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isAdminAuthenticated } from '../lib/auth';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  if (typeof window !== 'undefined' && isAdminAuthenticated()) {
    return <>{children}</>;
  }

  return <Navigate to="/admin" replace />;
}
