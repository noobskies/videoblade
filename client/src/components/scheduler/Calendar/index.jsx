import React, { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import { isSameDay } from 'date-fns';
import VideoEvent from './VideoEvent';
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
    const [hours, minutes] = formData.scheduledTime.split(':').map(Number);
    const startDateTime = new Date(formData.scheduledDate);
    startDateTime.setHours(hours, minutes, 0);

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
                duration: formData.duration,
                status: 'pending' // Add status field
              }
            : event
        )
      );
    } else {
      // Create separate events for each platform
      const newEvents = formData.platforms.map(platform => ({
        id: `${Date.now()}-${platform}`,
        title: formData.title,
        description: formData.description,
        platform: platform,
        video: formData.video,
        start: startDateTime,
        end: new Date(startDateTime.getTime() + formData.duration * 60000),
        duration: formData.duration,
        status: 'pending' // Add status field
      }));

      setEvents(prev => [...prev, ...newEvents]);
    }
    
    setIsEventFormOpen(false);
  };

  const filteredEvents = events.filter(event => 
    selectedPlatforms.includes(event.platform)
  );

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
            event: VideoEvent
          }}
          formats={{
            eventTimeRangeFormat: () => ''
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