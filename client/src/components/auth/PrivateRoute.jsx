// client/src/components/auth/PrivateRoute.jsx
import { useAuth } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;