import { Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import SignInPage from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import YouTubeCallback from './pages/platforms/YouTubeCallback';
import FacebookCallback from './pages/platforms/FacebookCallback';
import SchedulePost from './components/scheduler/SchedulePost';
import ScheduledPostsList from './components/scheduler/ScheduledPostsList';
import Upload from './pages/Upload';
import VideoCalendar from './components/scheduler/Calendar';

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
                <Route path="/platforms/facebook/callback" element={<FacebookCallback />} />
                <Route path="/scheduler" element={<VideoCalendar />} />
                <Route path="/scheduler/list" element={<ScheduledPostsList />} />
                <Route path="/scheduler/new" element={<SchedulePost />} />
                <Route path="/upload" element={<Upload />} />
                {/* TODO: Implement these routes */}
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