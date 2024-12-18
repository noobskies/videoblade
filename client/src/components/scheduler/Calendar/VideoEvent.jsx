// client/src/components/scheduler/Calendar/VideoEvent.jsx
import React from 'react';
import PlatformIcon from '../../common/VideoList/PlatformIcon';

// Platform color mapping
export const PLATFORM_COLORS = {
  youtube: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', hover: 'hover:bg-red-200' },
  facebook: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', hover: 'hover:bg-blue-200' },
  instagram: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200', hover: 'hover:bg-pink-200' },
  tiktok: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', hover: 'hover:bg-purple-200' },
  twitter: { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200', hover: 'hover:bg-sky-200' }
};

const VideoEvent = ({ event }) => {
  const platform = event.platform || 'youtube';
  const colors = PLATFORM_COLORS[platform] || PLATFORM_COLORS.youtube;
  
  return (
    <div className="group relative">
      <div className={`rounded-lg p-1 ${colors.bg} ${colors.text} ${colors.border} border text-sm truncate 
        ${colors.hover} transition-colors duration-200`}
      >
        <div className="flex items-center gap-1">
          <PlatformIcon platform={platform} className="w-3 h-3" />
          <span className="truncate">{event.title}</span>
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute hidden group-hover:block bottom-full left-0 mb-1 bg-white p-2 rounded shadow-lg border z-50 min-w-[200px]">
        <div className="text-sm font-medium">{event.title}</div>
        <div className="text-xs text-gray-500 mt-1">{event.description}</div>
        <div className="text-xs text-gray-500 mt-1">
          {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        {event.status && (
          <div className={`text-xs mt-1 ${
            event.status === 'published' ? 'text-green-600' :
            event.status === 'failed' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            Status: {event.status}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoEvent;