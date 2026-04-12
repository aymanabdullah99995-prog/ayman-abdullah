import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      // Check if we are already on the login page to avoid infinite loops
      // But since this is a SPA, we usually handle this with routing.
      // For now, if not authenticated, we redirect to the legacy login.html 
      // or we could implement a React Login component.
      // The user asked for a "صفحة Login" in React.
      // I will implement a Login component and use it in App.tsx.
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null; // Or a loading spinner, but App.tsx will handle showing Login
  }

  return <>{children}</>;
};

export default ProtectedRoute;
