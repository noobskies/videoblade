import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus,
  Filter
} from 'lucide-react';
import PlatformIcon from '../../common/VideoList/PlatformIcon';

const PLATFORMS = [
  { id: 'youtube', name: 'YouTube' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'twitter', name: 'Twitter' }
];

const CalendarToolbar = ({ 
  date, 
  view,
  views,
  onNavigate,
  onView,
  onAddEvent,
  selectedPlatforms,
  onPlatformFilterChange 
}) => {
  const navigate = (action) => {
    onNavigate(action);
  };

  const viewNames = {
    month: 'Month',
    week: 'Week',
    day: 'Day'
  };

  const getCurrentDateLabel = () => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
      ...(view === 'week' && { week: 'numeric' }),
      ...(view === 'day' && { day: 'numeric' })
    });
    return formatter.format(date);
  };

  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-4 p-4 border-b bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left Section - Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('TODAY')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Today
          </button>
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={() => navigate('PREV')}
              className="p-2 hover:bg-gray-50 border-r border-gray-300"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => navigate('NEXT')}
              className="p-2 hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <span className="ml-4 text-lg font-semibold text-gray-900">
            {getCurrentDateLabel()}
          </span>
        </div>

        {/* Center Section - View Selector */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          {views.map(name => (
            <button
              key={name}
              onClick={() => onView(name)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${view === name 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-200'
                }`}
            >
              {viewNames[name]}
            </button>
          ))}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md inline-flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              <span className="text-sm">Filter</span>
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="p-2">
                  <div className="text-sm font-medium text-gray-900 mb-2">Platforms</div>
                  {PLATFORMS.map((platform) => (
                    <label
                      key={platform.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform.id)}
                        onChange={() => onPlatformFilterChange(platform.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <PlatformIcon platform={platform.id} className="w-5 h-5" />
                      <span className="text-sm text-gray-700">{platform.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={onAddEvent}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarToolbar;