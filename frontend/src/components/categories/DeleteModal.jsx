import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  XMarkIcon, 
  ExclamationTriangleIcon,
  TrashIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import axiosInstance from '../../config/axios';

const DeleteModal = ({ type, category, selectedIds, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const deleteCount = getDeleteCount();
    const loadingToast = toast.loading(
      type === 'single' 
        ? 'Deleting category...' 
        : `Deleting ${deleteCount} categories...`
    );

    try {
      let response;

      if (type === 'single') {
        response = await axiosInstance.delete(`/categories/${category.id}`);
      } else {
        response = await axiosInstance.post('/categories/bulk-delete', {
          ids: selectedIds
        });
      }

      const { data } = response;

      if (data.success) {
        toast.dismiss(loadingToast);
        
        if (type === 'single') {
          toast.success(`Category "${category.name}" deleted successfully!`);
        } else {
          toast.success(`${deleteCount} categories deleted successfully!`);
        }
        
        onSuccess();
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.dismiss(loadingToast);
      toast.error(
        error.response?.data?.message || 
        'Failed to delete. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getDeleteCount = () => {
    return type === 'single' ? 1 : selectedIds.length;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
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
          <div className="bg-red-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ExclamationTriangleIcon className="w-6 h-6" />
                Confirm Delete
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
          <div className="px-6 py-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {type === 'single' ? 'Delete Category' : `Delete ${getDeleteCount()} Categories`}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {type === 'single' ? (
                    <>
                      Are you sure you want to delete the category <span className="font-semibold text-gray-900 dark:text-white">"{category?.name}"</span>?
                    </>
                  ) : (
                    <>
                      Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{getDeleteCount()} categories</span>?
                    </>
                  )}
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <ExclamationCircleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      This action cannot be undone. All data associated with {type === 'single' ? 'this category' : 'these categories'} will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="animate-spin h-4 w-4 text-white" />
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon className="w-4 h-4" />
                  Delete {type === 'bulk' && `(${getDeleteCount()})`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;