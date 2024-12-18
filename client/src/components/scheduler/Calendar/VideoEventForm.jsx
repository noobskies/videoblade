import React, { useState, useEffect } from 'react';
import { Plus, Upload as UploadIcon } from 'lucide-react';
import PlatformIcon from '../../common/VideoList/PlatformIcon';
import Modal from '../../common/Modal';
import FileUploader from '../../common/VideoUpload/FileUploader';

const PLATFORMS = [
  { id: 'youtube', name: 'YouTube' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'twitter', name: 'Twitter' }
];

const VideoEventForm = ({ 
  isOpen, 
  onClose, 
  selectedDate,
  selectedEvent = null,
  onSubmit 
}) => {
  const getInitialFormData = () => ({
    title: selectedEvent?.title || '',
    description: selectedEvent?.description || '',
    platforms: selectedEvent?.platforms || [],
    video: selectedEvent?.video || null,
    scheduledDate: selectedEvent?.start || selectedDate || new Date(),
    scheduledTime: selectedEvent?.start 
      ? selectedEvent.start.toTimeString().slice(0, 5)
      : new Date().toTimeString().slice(0, 5),
    duration: selectedEvent?.duration || 60,
    isAllDay: selectedEvent?.isAllDay || false
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [videoFile, setVideoFile] = useState(null);

  // Reset form when opening for a new event or editing an existing one
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setVideoFile(null);
    }
  }, [isOpen, selectedEvent, selectedDate]);

  const handlePlatformToggle = (platformId) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      video: videoFile || formData.video
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-2xl">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {selectedEvent ? 'Edit Video Schedule' : 'Schedule New Video'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form Content */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platforms
            </label>
            <div className="flex flex-wrap gap-3">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => handlePlatformToggle(platform.id)}
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium
                    ${formData.platforms.includes(platform.id)
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <PlatformIcon platform={platform.id} className="w-5 h-5 mr-2" />
                  {platform.name}
                </button>
              ))}
            </div>
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video
            </label>
            <FileUploader
              onFileSelect={setVideoFile}
              accept="video/*"
              maxSize={1024 * 1024 * 100} // 100MB
              className="w-full"
            />
            {(videoFile || formData.video) && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {videoFile?.name || formData.video.name}
              </div>
            )}
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={formData.scheduledDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: new Date(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <input
                type="time"
                id="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
              min="15"
              step="15"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {selectedEvent ? 'Save Changes' : 'Schedule Video'}
        </button>
      </div>
    </Modal>
  );
};

export default VideoEventForm;