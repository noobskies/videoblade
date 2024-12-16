// client/src/pages/Dashboard.jsx
import VideoList from '../components/platforms/youtube/YouTubeVideoList';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your content across platforms
        </p>
      </div>

      <VideoList />
    </div>
  );
};

export default Dashboard;