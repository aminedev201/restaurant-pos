import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

/**
 * DeleteConfirmModalUser
 *
 * Pure UI/UX confirmation modal for destructive user-profile actions.
 * No API calls — the parent handles all async logic via onConfirm.
 *
 * Props:
 *  @param {string}   title            Modal heading                       (default: 'Confirm Delete')
 *  @param {string}   entityName       Human-readable entity e.g. 'avatar', 'account'
 *  @param {string}   itemLabel        Display label shown in description   (default: '')
 *  @param {string}   [warningMessage] Extra line shown in the red warning box
 *  @param {boolean}  loading          Shows spinner + disables buttons while parent is working
 *  @param {function} onClose          Called when user dismisses the modal
 *  @param {function} onConfirm        Called when user clicks the confirm/delete button
 *
 * Usage:
 *
 * // Remove avatar
 * <DeleteConfirmModalUser
 *   title="Remove Avatar"
 *   entityName="avatar"
 *   itemLabel="your avatar"
 *   warningMessage="Your avatar image will be permanently deleted from storage."
 *   loading={removing}
 *   onClose={() => setShowRemoveAvatarModal(false)}
 *   onConfirm={handleRemoveAvatarConfirm}
 * />
 *
 * // Delete account
 * <DeleteConfirmModalUser
 *   title="Delete Account"
 *   entityName="account"
 *   itemLabel="your account"
 *   warningMessage="All your data, avatar, and active sessions will be permanently removed. This cannot be undone."
 *   loading={deleteLoading}
 *   onClose={() => setShowDeleteAccountModal(false)}
 *   onConfirm={handleDestroyAccountConfirm}
 * />
 */
const DeleteConfirmModalUser = ({
  title          = 'Confirm Delete',
  entityName     = 'item',
  itemLabel      = '',
  warningMessage,
  loading        = false,
  onClose,
  onConfirm,
}) => {
  const entityLabel = entityName.charAt(0).toUpperCase() + entityName.slice(1);

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
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
              dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700
              transition-colors disabled:opacity-40"
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
              Delete {entityLabel}
            </h3>
          </div>

          {/* Description */}
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Are you sure you want to delete the {entityName}{' '}
            {itemLabel && (
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                "{itemLabel}"
              </span>
            )}?
          </p>

          {/* Warning box */}
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700 leading-relaxed dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
            <p>
              ⚠️ This action <strong>cannot be undone</strong>. All data associated with
              this {entityName} will be permanently deleted.
            </p>
            {warningMessage && (
              <p className="mt-2">{warningMessage}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 dark:bg-gray-700/50 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg
              hover:bg-gray-50 transition-colors disabled:opacity-40
              dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-red-500 rounded-lg
              hover:bg-red-600 active:bg-red-700 transition-colors
              disabled:opacity-60 disabled:cursor-not-allowed
              dark:bg-red-600 dark:hover:bg-red-700"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>Delete</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteConfirmModalUser;