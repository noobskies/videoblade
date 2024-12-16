// client/src/components/auth/ClerkProviderWithRoutes.jsx
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';

const ClerkProviderWithRoutes = ({ children }) => {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <BrowserRouter>{children}</BrowserRouter>
    </ClerkProvider>
  );
};

export default ClerkProviderWithRoutes;