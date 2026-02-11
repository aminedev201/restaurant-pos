import { 
  XMarkIcon, 
  EyeIcon,
  PencilSquareIcon,
  CalendarIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

const ShowCategoryModal = ({ category, onClose, onEdit }) => {
  if (!category) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <style>{`
        .description-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .description-scroll::-webkit-scrollbar-track {
          background: #e5e7eb;
          border-radius: 4px;
        }
        .dark .description-scroll::-webkit-scrollbar-track {
          background: #374151;
        }
        .description-scroll::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 4px;
        }
        .dark .description-scroll::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
        .description-scroll::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        .dark .description-scroll::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
      
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <EyeIcon className="w-6 h-6" />
                Category Details
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="description-scroll px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Category Name */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Category Name
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {category.name}
              </p>
            </div>

            {/* Description */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Description
              </label>
              <div className="description-scroll max-h-[300px] overflow-y-auto pr-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {category.description || 'No description provided'}
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Created At */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Created At
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span>{new Date(category.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Updated At */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Updated At
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <ArrowPathIcon className="w-4 h-4 text-gray-400" />
                  <span>{new Date(category.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
            >
              Close
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(category);
                }}
                className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <PencilSquareIcon className="w-4 h-4" />
                Edit Category
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowCategoryModal;