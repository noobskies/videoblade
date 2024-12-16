// client/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import SignInPage from './pages/SignIn';
import Dashboard from './pages/Dashboard';

const App = () => {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  return (
    <BrowserRouter>
      <ClerkProvider 
        publishableKey={clerkPubKey}
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "bg-white shadow-lg rounded-lg",
            formButtonPrimary: "bg-primary-600 hover:bg-primary-700 text-white",
            formFieldInput: "rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500",
            footerActionLink: "text-primary-600 hover:text-primary-700",
            formFieldLabel: "text-gray-700"
          }
        }}
      >
        <div className="min-h-screen bg-gray-50">
          <SignedIn>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
              </Routes>
            </main>
          </SignedIn>
          
          <SignedOut>
            <Routes>
              <Route path="*" element={<SignInPage />} />
            </Routes>
          </SignedOut>
        </div>
      </ClerkProvider>
    </BrowserRouter>
  );
};

export default App;