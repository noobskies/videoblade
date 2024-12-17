// client/src/components/common/VideoUpload/ProgressBar.jsx
const ProgressBar = ({ progress, status }) => {
    return (
      <div className="w-full">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">
            {status || 'Uploading...'}
          </span>
          <span className="text-sm font-medium text-gray-700">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };
  
  export default ProgressBar;