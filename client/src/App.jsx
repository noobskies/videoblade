// client/src/App.jsx
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/auth/PrivateRoute';
import Dashboard from './pages/Dashboard';
import PublicPage from './pages/PublicPage';

const App = () => {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicPage />} />
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
};

export default App;