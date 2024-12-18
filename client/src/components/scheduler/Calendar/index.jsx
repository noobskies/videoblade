import React, { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import CalendarToolbar from './CalendarToolbar';
import VideoEventForm from './VideoEventForm';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

const VideoCalendar = () => {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [selectedPlatforms, setSelectedPlatforms] = useState(['youtube', 'facebook', 'instagram', 'tiktok', 'twitter']);
  
  // Modal state
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
    // When a time slot is clicked
    setSelectedDate(slotInfo.start);
    setSelectedEventData(null); // Clear any previously selected event
    setIsEventFormOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event) => {
    // When an existing event is clicked
    setSelectedEventData(event);
    setSelectedDate(event.start);
    setIsEventFormOpen(true);
  }, []);

  const handleEventDrop = useCallback(({ event, start, end }) => {
    setEvents((currentEvents) => {
      const updatedEvents = currentEvents.map((e) => 
        e.id === event.id ? { ...e, start, end } : e
      );
      return updatedEvents;
    });
    // TODO: Call API to update event timing
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
    const startDateTime = new Date(`${formData.scheduledDate.toISOString().split('T')[0]}T${formData.scheduledTime}`);
    // Set end time to 1 hour after start by default
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    if (selectedEventData) {
      // Update existing event
      setEvents(currentEvents =>
        currentEvents.map(event =>
          event.id === selectedEventData.id
            ? {
                ...event,
                title: formData.title,
                description: formData.description,
                platforms: formData.platforms,
                video: formData.video,
                start: startDateTime,
                end: endDateTime
              }
            : event
        )
      );
    } else {
      // Create new event
      const newEvent = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        platforms: formData.platforms,
        video: formData.video,
        start: startDateTime,
        end: endDateTime,
      };
      setEvents(currentEvents => [...currentEvents, newEvent]);
    }
    
    setIsEventFormOpen(false);
  };

  // Filter events based on selected platforms
  const filteredEvents = events.filter(event => 
    event.platforms?.some(platform => selectedPlatforms.includes(platform))
  );

  return (
    <div className="h-screen w-full p-4 bg-white">
      <div className="h-full rounded-lg shadow-lg overflow-hidden">
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          selectable
          resizable
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
            )
          }}
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