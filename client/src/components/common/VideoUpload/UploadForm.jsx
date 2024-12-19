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
    scheduledTime: '',
    // YouTube specific fields
    categoryId: '22', // Default to 'People & Blogs'
    madeForKids: false,
    language: 'en'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert tags string to array and clean it up
    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    const processedData = {
      ...formData,
      tags
    };

    onSubmit(processedData);
  };

  // YouTube category options
  const youTubeCategories = [
    { id: '1', name: 'Film & Animation' },
    { id: '2', name: 'Autos & Vehicles' },
    { id: '10', name: 'Music' },
    { id: '15', name: 'Pets & Animals' },
    { id: '17', name: 'Sports' },
    { id: '19', name: 'Travel & Events' },
    { id: '20', name: 'Gaming' },
    { id: '22', name: 'People & Blogs' },
    { id: '23', name: 'Comedy' },
    { id: '24', name: 'Entertainment' },
    { id: '25', name: 'News & Politics' },
    { id: '26', name: 'How-to & Style' },
    { id: '27', name: 'Education' },
    { id: '28', name: 'Science & Technology' },
    { id: '29', name: 'Nonprofits & Activism' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
          <span className="text-red-500 ml-1">*</span>
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
          placeholder="Enter video title"
        />
      </div>

      {/* Description */}
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
          placeholder="Enter video description"
        />
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags
        </label>
        <input
          type="text"
          name="tags"
          id="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="gaming, tutorial, tech (comma-separated)"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isUploading}
        />
        <p className="mt-1 text-sm text-gray-500">
          Separate tags with commas
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Privacy Setting */}
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

        {/* Schedule Time */}
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
            min={new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={isUploading}
          />
        </div>
      </div>

      {platform === 'youtube' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* YouTube Category */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="categoryId"
              id="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={isUploading}
            >
              {youTubeCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Language
            </label>
            <select
              name="language"
              id="language"
              value={formData.language}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={isUploading}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              {/* Add more languages as needed */}
            </select>
          </div>
        </div>
      )}

      {platform === 'youtube' && (
        <div className="flex items-center">
          <input
            type="checkbox"
            name="madeForKids"
            id="madeForKids"
            checked={formData.madeForKids}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={isUploading}
          />
          <label htmlFor="madeForKids" className="ml-2 block text-sm text-gray-700">
            This content is made for kids
          </label>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isUploading || !formData.title}
          className={`
            inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm
            ${isUploading || !formData.title
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }
          `}
        >
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </div>
    </form>
  );
};

export default UploadForm;