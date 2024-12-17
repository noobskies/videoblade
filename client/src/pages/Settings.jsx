import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import YouTubeConnect from '../components/platforms/youtube/YouTubeConnect';
import FacebookConnect from '../components/platforms/facebook/FacebookConnect';

const Settings = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('platforms');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Settings Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account and platform connections
        </p>
      </div>

      {/* Settings Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('platforms')}
            className={`pb-4 px-1 ${
              activeTab === 'platforms'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Platform Connections
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-1 ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile
          </button>
        </nav>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'platforms' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Connected Platforms
            </h2>
            
            {/* Platform Connections */}
            <div className="space-y-6">
              <YouTubeConnect />
              <div className="border-t pt-6">
                <FacebookConnect />
              </div>
              
              {/* Coming Soon Platforms */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between opacity-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                      <span className="text-gray-500">TT</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">TikTok</h3>
                      <p className="text-sm text-gray-500">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* More Coming Soon Platforms */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Instagram */}
                  <div className="flex items-center justify-between opacity-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                        <span className="text-gray-500">IG</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Instagram</h3>
                        <p className="text-sm text-gray-500">Coming soon</p>
                      </div>
                    </div>
                  </div>

                  {/* Twitter/X */}
                  <div className="flex items-center justify-between opacity-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                        <span className="text-gray-500">X</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Twitter/X</h3>
                        <p className="text-sm text-gray-500">Coming soon</p>
                      </div>
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div className="flex items-center justify-between opacity-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                        <span className="text-gray-500">LI</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">LinkedIn</h3>
                        <p className="text-sm text-gray-500">Coming soon</p>
                      </div>
                    </div>
                  </div>

                  {/* Threads */}
                  <div className="flex items-center justify-between opacity-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                        <span className="text-gray-500">TH</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Threads</h3>
                        <p className="text-sm text-gray-500">Coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <img 
                src={user?.imageUrl} 
                alt={user?.fullName} 
                className="h-12 w-12 rounded-full"
              />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {user?.fullName}
                </h3>
                <p className="text-sm text-gray-500">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;