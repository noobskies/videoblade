import React, { useState } from 'react';
import { 
  MoreVertical, 
  Plus,
  Edit,
  Trash,
  Pause,
  Play,
  Calendar
} from 'lucide-react';
import SchedulePost from './SchedulePost';

const ScheduledPostsList = () => {

  // Demo data grouped by date
  const [posts] = useState({
    'Today, December 17': [
      {
        id: 1,
        time: '12:29 PM',
        title: 'Summer Product Launch',
        platforms: ['youtube', 'facebook'],
        status: 'scheduled'
      },
      {
        id: 2,
        time: '5:24 PM',
        title: 'Holiday Special',
        platforms: ['youtube'],
        status: 'draft'
      }
    ],
    'Tomorrow, December 18': [
      {
        id: 3,
        time: '12:29 PM',
        title: 'New Year Planning',
        platforms: ['youtube'],
        status: 'scheduled'
      }
    ],
    'Thursday, December 19': [
      {
        id: 4,
        time: '2:30 PM',
        title: 'Product Demo',
        platforms: ['youtube', 'facebook'],
        status: 'scheduled'
      }
    ]
  });

  const [openMenuId, setOpenMenuId] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedScheduleTime, setSelectedScheduleTime] = useState({
    date: '',
    time: ''
  });

  const toggleMenu = (postId) => {
    setOpenMenuId(openMenuId === postId ? null : postId);
  };

  const handleAddToQueue = (date) => {
    setSelectedScheduleTime({
      date: date,
      time: '' // Optional: You could set a default time here
    });
    setShowScheduleModal(true);
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'youtube':
        return 'YT';
      case 'facebook':
        return 'FB';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Queue</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your upcoming social media posts
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/scheduler/new'}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Post
        </button>
      </div>

      {/* Timeline View with Vertical Line */}
      <div className="relative">
        {/* Vertical Timeline Line */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />

        {/* Posts Timeline */}
        <div className="space-y-8 pl-8">
          {Object.entries(posts).map(([date, dayPosts], dateIndex) => (
            <div key={date} className="relative">
              {/* Date Point */}
              <div className="absolute -left-8 mt-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
              </div>

              {/* Date Header */}
              <h2 className="text-sm font-medium text-gray-500 mb-4">{date}</h2>
              
              {/* Posts for this date */}
              <div className="space-y-4">
                {dayPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-4">
                      {/* Time and Actions */}
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-600">
                          {post.time}
                        </span>
                        <div className="relative">
                          <button
                            className="p-1 rounded-full hover:bg-gray-100"
                            onClick={() => toggleMenu(post.id)}
                          >
                            <MoreVertical className="h-5 w-5 text-gray-400" />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === post.id && (
                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-10">
                              <div className="py-1">
                                <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                  <Edit className="mr-3 h-4 w-4" />
                                  Edit
                                </button>
                                <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                  <Calendar className="mr-3 h-4 w-4" />
                                  Reschedule
                                </button>
                                {post.status === 'scheduled' ? (
                                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                    <Pause className="mr-3 h-4 w-4" />
                                    Pause
                                  </button>
                                ) : (
                                  <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                    <Play className="mr-3 h-4 w-4" />
                                    Resume
                                  </button>
                                )}
                              </div>
                              <div className="py-1">
                                <button className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left">
                                  <Trash className="mr-3 h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {post.title}
                        </h3>
                        
                        {/* Platforms */}
                        <div className="flex space-x-2">
                          {post.platforms.map(platform => (
                            <span 
                              key={platform} 
                              className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-xs font-medium text-gray-800"
                            >
                              {getPlatformIcon(platform)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add New Time Slot */}
                <button 
                onClick={() => handleAddToQueue(date)} // Add this onClick handler
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                <div className="flex items-center justify-center">
                    <Plus className="h-4 w-4 mr-2" />
                    <span>New</span>
                </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showScheduleModal && (
        <SchedulePost
            isModal={true}
            onClose={() => setShowScheduleModal(false)}
            preselectedDate={selectedScheduleTime.date}
            preselectedTime={selectedScheduleTime.time}
        />
      )}
    </div>
  );
};

export default ScheduledPostsList;