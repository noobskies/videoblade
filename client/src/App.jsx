// client/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import SignInPage from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import YouTubeCallback from './pages/platforms/YouTubeCallback';
import Upload from './pages/Upload';

const App = () => {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  return (
    <BrowserRouter>
      <ClerkProvider publishableKey={clerkPubKey}>
        <div className="min-h-screen bg-gray-50">
          <SignedIn>
            <Navbar />
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/platforms/youtube/callback" element={<YouTubeCallback />} />
                <Route path="/upload" element={<Upload />} />
                {/* TODO: Implement these routes */}
                {/* <Route path="/schedule" element={<Schedule />} /> */}
                {/* <Route path="/analytics" element={<Analytics />} /> */}
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