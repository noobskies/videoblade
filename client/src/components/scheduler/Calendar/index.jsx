import React, { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import { isSameDay } from 'date-fns';
import PlatformIcon from '../../common/VideoList/PlatformIcon';
import CalendarToolbar from './CalendarToolbar';
import VideoEventForm from './VideoEventForm';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Platform color mapping
const PLATFORM_COLORS = {
  youtube: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', hover: 'hover:bg-red-200' },
  facebook: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', hover: 'hover:bg-blue-200' },
  instagram: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200', hover: 'hover:bg-pink-200' },
  tiktok: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', hover: 'hover:bg-purple-200' },
  twitter: { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200', hover: 'hover:bg-sky-200' }
};

// Custom event component
const EventComponent = ({ event }) => {
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
      
      {/* Simple tooltip */}
      <div className="absolute hidden group-hover:block bottom-full left-0 mb-1 bg-white p-2 rounded shadow-lg border z-50 min-w-[200px]">
        <div className="text-sm font-medium">{event.title}</div>
        <div className="text-xs text-gray-500 mt-1">{event.description}</div>
        <div className="text-xs text-gray-500 mt-1">
          {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

const DnDCalendar = withDragAndDrop(Calendar);

const VideoCalendar = () => {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [selectedPlatforms, setSelectedPlatforms] = useState(['youtube', 'facebook', 'instagram', 'tiktok', 'twitter']);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedEventData, setSelectedEventData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleNavigate = useCallback((newDate) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  const handleSelectSlot = useCallback((slotInfo) => {
    setSelectedDate(slotInfo.start);
    setSelectedEventData(null);
    setIsEventFormOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEventData(event);
    setSelectedDate(event.start);
    setIsEventFormOpen(true);
  }, []);

  const handleEventDrop = useCallback(({ event, start }) => {
    const end = new Date(start.getTime() + (event.duration || 60) * 60000);
    
    if (isSameDay(start, end)) {
      setEvents((currentEvents) => {
        return currentEvents.map((existingEvent) => {
          if (existingEvent.id === event.id) {
            return {
              ...existingEvent,
              start,
              end
            };
          }
          return existingEvent;
        });
      });
    }
  }, []);

  const handlePlatformFilterChange = useCallback((platform) => {
    setSelectedPlatforms((current) => {
      if (current.includes(platform)) {
        return current.filter(p => p !== platform);
      }
      return [...current, platform];
    });
  }, []);

  const handleEventSubmit = (formData) => {
    console.log('Received form data:', formData);

    // Parse the time string correctly
    const [hours, minutes] = formData.scheduledTime.split(':').map(Number);
    const startDateTime = new Date(formData.scheduledDate);
    startDateTime.setHours(hours, minutes, 0);
    
    console.log('Calculated start datetime:', startDateTime);

    if (selectedEventData) {
      // Update existing event
      setEvents(currentEvents =>
        currentEvents.map(event =>
          event.id === selectedEventData.id
            ? {
                ...event,
                title: formData.title,
                description: formData.description,
                platform: event.platform,
                video: formData.video,
                start: startDateTime,
                end: new Date(startDateTime.getTime() + formData.duration * 60000),
                duration: formData.duration
              }
            : event
        )
      );
    } else {
      // Create separate events for each platform
      const newEvents = formData.platforms.map(platform => {
        const platformIndex = formData.platforms.indexOf(platform);
        const eventStart = new Date(startDateTime.getTime() + (platformIndex * 2 * 60000));
        const eventEnd = new Date(eventStart.getTime() + formData.duration * 60000);
        
        const newEvent = {
          id: `${Date.now()}-${platform}`,
          title: formData.title,
          description: formData.description,
          platform: platform,
          video: formData.video,
          start: eventStart,
          end: eventEnd,
          duration: formData.duration
        };

        console.log('Created new event:', newEvent);
        return newEvent;
      });

      setEvents(prev => {
        const updatedEvents = [...prev, ...newEvents];
        console.log('Updated events array:', updatedEvents);
        return updatedEvents;
      });
    }
    
    setIsEventFormOpen(false);
  };

  // Filter events based on selected platforms
  const filteredEvents = events.filter(event => 
    selectedPlatforms.includes(event.platform)
  );

  console.log('Rendering calendar with events:', filteredEvents);

  return (
    <div className="h-screen w-full p-4 bg-white">
      <div className="h-full rounded-lg shadow-lg overflow-hidden">
        <DnDCalendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          selectable
          resizable={false}
          defaultView={view}
          view={view}
          onView={handleViewChange}
          date={date}
          onNavigate={handleNavigate}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onEventDrop={handleEventDrop}
          className="flex-1 min-h-[600px]"
          views={['month', 'week', 'day']}
          components={{
            toolbar: (props) => (
              <CalendarToolbar 
                {...props}
                selectedPlatforms={selectedPlatforms}
                onPlatformFilterChange={handlePlatformFilterChange}
                onAddEvent={() => {
                  setSelectedDate(new Date());
                  setSelectedEventData(null);
                  setIsEventFormOpen(true);
                }}
              />
            ),
            event: EventComponent
          }}
          formats={{
            eventTimeRangeFormat: () => '' // Hide the time range in month view
          }}
          draggableAccessor={() => true}
          step={30}
          timeslots={2}
        />

        <VideoEventForm
          isOpen={isEventFormOpen}
          onClose={() => setIsEventFormOpen(false)}
          selectedDate={selectedDate}
          selectedEvent={selectedEventData}
          onSubmit={handleEventSubmit}
        />
      </div>
    </div>
  );
};

export default VideoCalendar;