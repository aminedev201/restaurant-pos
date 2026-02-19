import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import axiosInstance from '../../config/axios';

/**
 * Generic DeleteModal — works for any entity across all pages.
 *
 * Props:
 * @param {'single' | 'bulk'}  type           - Delete mode
 * @param {object}             item           - The single item to delete (for type='single')
 * @param {string[]}           selectedIds    - Array of IDs (for type='bulk')
 * @param {string}             endpoint       - Base API path e.g. '/categories', '/products', '/users'
 * @param {string}             entityName     - Human-readable entity name e.g. 'category', 'product', 'user'
 * @param {string}             [labelField]   - Field on item used as display label (default: 'name')
 * @param {'post'|'delete'}    [bulkMethod]   - HTTP method for bulk delete (default: 'post')
 * @param {string}             [warningMessage] - Optional custom warning below the default message
 * @param {function}           onClose        - Called when modal is dismissed
 * @param {function}           onSuccess      - Called after successful deletion
 *
 * Usage examples:
 *
 * // Single delete
 * <DeleteModal
 *   type="single"
 *   item={selectedCategory}
 *   endpoint="/categories"
 *   entityName="category"
 *   onClose={handleClose}
 *   onSuccess={handleSuccess}
 * />
 *
 * // Bulk delete for products (label from 'title' field)
 * <DeleteModal
 *   type="bulk"
 *   selectedIds={selectedProductIds}
 *   endpoint="/products"
 *   entityName="product"
 *   labelField="title"
 *   onClose={handleClose}
 *   onSuccess={handleSuccess}
 * />
 *
 * // Bulk delete using DELETE method instead of POST
 * <DeleteModal
 *   type="bulk"
 *   selectedIds={selectedUserIds}
 *   endpoint="/users"
 *   entityName="user"
 *   labelField="email"
 *   bulkMethod="delete"
 *   onClose={handleClose}
 *   onSuccess={handleSuccess}
 * />
 */
const DeleteModal = ({
  type,
  item,
  selectedIds = [],
  endpoint,
  entityName = 'item',
  labelField = 'name',
  bulkMethod = 'post',
  warningMessage,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  // Capitalize first letter for display
  const entityLabel = entityName.charAt(0).toUpperCase() + entityName.slice(1);
  const deleteCount = type === 'single' ? 1 : selectedIds.length;
  const itemLabel = item?.[labelField] ?? '';

  const handleDelete = async () => {
    setLoading(true);
    const loadingToast = toast.loading(
      type === 'single'
        ? `Deleting ${entityName}...`
        : `Deleting ${deleteCount} ${entityName}s...`
    );

    try {
      let response;

      if (type === 'single') {
        response = await axiosInstance.delete(`${endpoint}/${item.id}`);
      } else {
        if (bulkMethod === 'delete') {
          response = await axiosInstance.delete(`${endpoint}/bulk-delete`, {
            data: { ids: selectedIds },
          });
        } else {
          response = await axiosInstance.post(`${endpoint}/bulk-delete`, {
            ids: selectedIds,
          });
        }
      }

      const { data } = response;

      toast.dismiss(loadingToast);

      if (data.success) {
        const successMessage =
          type === 'single'
            ? `${entityLabel} "${itemLabel}" deleted successfully!`
            : `${deleteCount} ${entityName}${deleteCount !== 1 ? 's' : ''} deleted successfully!`;

        toast.success(successMessage);
        onSuccess();
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.dismiss(loadingToast);
      toast.error(
        error.response?.data?.message || 'Failed to delete. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Confirm Delete</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          {/* Icon + Title */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10">
              <ExclamationTriangleIcon className="w-7 h-7 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {type === 'single'
                ? `Delete ${entityLabel}`
                : `Delete ${deleteCount} ${entityLabel}${deleteCount !== 1 ? 's' : ''}`}
            </h3>
          </div>

          {/* Description */}
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {type === 'single' ? (
              <>
                Are you sure you want to delete the {entityName}{' '}
                <span className="font-semibold text-gray-800 dark:text-gray-200">"{itemLabel}"</span>?
              </>
            ) : (
              <>
                Are you sure you want to delete{' '}
                <span className="font-semibold text-gray-800 dark:text-gray-200">{deleteCount}</span>{' '}
                {entityName}{deleteCount !== 1 ? 's' : ''}?
              </>
            )}
          </p>

          {/* Warning box */}
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700 leading-relaxed dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
            <p>
              ⚠️ This action <strong>cannot be undone</strong>. All data associated with{' '}
              {type === 'single' ? 'this' : 'these'} {entityName}{type !== 'single' ? 's' : ''} will be permanently deleted.
            </p>
            {warningMessage && (
              <p className="mt-2">{warningMessage}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 dark:bg-gray-700/50 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed dark:bg-red-600 dark:hover:bg-red-700"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                Delete{type === 'bulk' ? ` (${deleteCount})` : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;