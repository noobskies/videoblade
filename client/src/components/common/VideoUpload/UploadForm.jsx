// client/src/components/common/VideoUpload/UploadForm.jsx
import { useState } from 'react';

const UploadForm = ({ 
  onSubmit, 
  isUploading = false,
  platform = 'youtube'
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    privacy: 'private',
    scheduledTime: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert tags string to array
    const processedData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };
    onSubmit(processedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isUploading}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isUploading}
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          name="tags"
          id="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="video, tutorial, tech"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isUploading}
        />
      </div>

      <div>
        <label htmlFor="privacy" className="block text-sm font-medium text-gray-700">
          Privacy
        </label>
        <select
          name="privacy"
          id="privacy"
          value={formData.privacy}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isUploading}
        >
          <option value="private">Private</option>
          <option value="unlisted">Unlisted</option>
          <option value="public">Public</option>
        </select>
      </div>

      <div>
        <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700">
          Schedule Upload
        </label>
        <input
          type="datetime-local"
          name="scheduledTime"
          id="scheduledTime"
          value={formData.scheduledTime}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isUploading}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isUploading || !formData.title}
          className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm
            ${isUploading || !formData.title
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
        >
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </div>
    </form>
  );
};

export default UploadForm;