import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const RoleSelector = () => {
  // This component is now replaced by AuthPage
  // Redirect to auth page
  return <Navigate to="/auth" replace />;
};
