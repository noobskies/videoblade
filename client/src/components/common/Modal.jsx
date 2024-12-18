import { useEffect } from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  children,
  className = ''
}) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-white rounded-lg shadow-xl overflow-hidden ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default Modal;