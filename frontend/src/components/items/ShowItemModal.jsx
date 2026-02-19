import {
  XMarkIcon,
  EyeIcon,
  PencilSquareIcon,
  CalendarIcon,
  ArrowPathIcon,
  TagIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const SvgPreview = ({ svg, className = 'w-4 h-4' }) => {
  if (!svg) return null;
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
};

const ShowItemModal = ({ item, onClose, onEdit }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <style>{`
        .item-scroll::-webkit-scrollbar { width: 8px; }
        .item-scroll::-webkit-scrollbar-track { background: #e5e7eb; border-radius: 4px; }
        .dark .item-scroll::-webkit-scrollbar-track { background: #374151; }
        .item-scroll::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 4px; }
        .dark .item-scroll::-webkit-scrollbar-thumb { background: #4b5563; }
        .item-scroll::-webkit-scrollbar-thumb:hover { background: #6b7280; }
      `}</style>

      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <EyeIcon className="w-6 h-6" />
                Item Details
              </h3>
              <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="item-scroll px-6 py-6 space-y-5 max-h-[65vh] overflow-y-auto">

            {/* Image */}
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <img
                src={item.image_path_url}
                alt={item.title}
                className="w-full h-56 object-cover"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
              />
            </div>

            {/* Title */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Title
              </label>
              {/* ← capitalize */}
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {item.title}
              </p>
            </div>

            {/* Category + Price */}
            <div className="grid grid-cols-2 gap-4">
              {/* Category with icon */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="flex items-center gap-2.5">
                  {item.category?.icon ? (
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                      <SvgPreview svg={item.category.icon} className="w-4 h-4 [&>svg]:w-full [&>svg]:h-full" />
                    </span>
                  ) : (
                    <TagIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  {/* ← capitalize */}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {item.category?.name || '-'}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Price
                </label>
                <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <CurrencyDollarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {Number(item.price).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Description
              </label>
              <div className="item-scroll max-h-[200px] overflow-y-auto pr-1">
                {/* ← lowercase first-letter:uppercase */}
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap lowercase first-letter:uppercase">
                  {item.description || 'No description provided'}
                </p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Created At
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Updated At
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <ArrowPathIcon className="w-4 h-4 text-gray-400" />
                  <span>{new Date(item.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
            >
              Close
            </button>
            {onEdit && (
              <button
                onClick={() => { onClose(); onEdit(item); }}
                className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <PencilSquareIcon className="w-4 h-4" />
                Edit Item
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowItemModal;