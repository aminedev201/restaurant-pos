import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { XMarkIcon, PlusIcon, PencilSquareIcon, CheckIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import axiosInstance from '../../config/axios';

const CategoryModal = ({ mode, category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const maxLength = 1000;

  useEffect(() => {
    if (category && mode === 'edit') {
      setFormData({
        name: category.name || '',
        description: category.description || ''
      });
    }
  }, [category, mode]);

  const validate = () => {
    const newErrors = {};
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 255) {
      newErrors.name = 'Name must not exceed 255 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > maxLength) {
      newErrors.description = 'Description must not exceed ' + maxLength + ' characters';
    }

    setErrors(newErrors);    
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading(
      mode === 'create' ? 'Creating category...' : 'Updating category...'
    );

    try {
      let response;
      
      if (mode === 'create') {
        response = await axiosInstance.post('/categories', formData);
      } else {
        response = await axiosInstance.put(`/categories/${category.id}`, formData);
      }

      const { data } = response;

      if (data.success) {
        toast.dismiss(loadingToast);
        toast.success(
          mode === 'create' 
            ? `Category "${formData.name}" created successfully!` 
            : `Category "${formData.name}" updated successfully!`
        );
        onSuccess();
      } else {
        toast.dismiss(loadingToast);
        // Handle validation errors from backend
        if (data.errors) {
          setErrors(data.errors);
        } else {
          console.error(data.message || 'Operation failed');
        }
      }
    } catch (error) {

      toast.dismiss(loadingToast);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error(
          error.response?.data?.message || 
          `Failed to ${mode === 'create' ? 'create' : 'update'} category. Please try again.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    return mode === 'create' ? 'Create Category' : 'Edit Category';
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

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-[95vw] sm:max-w-lg mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {mode === 'create' ? (
                  <PlusIcon className="w-6 h-6" />
                ) : (
                  <PencilSquareIcon className="w-6 h-6" />
                )}
                {getTitle()}
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
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6 space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                    errors.name
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter category description (optional)"
                  rows="4"
                  maxLength={maxLength}
                  className={`focus:outline-none w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none max-h-[200px] overflow-y-auto ${
                    errors.description
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={loading}
                ></textarea>
                <div className="flex items-center justify-between mt-2">
                  {errors.description ? (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <ExclamationCircleIcon className="w-4 h-4" />
                      {errors.description}
                    </p>
                  ) : (
                    <span></span>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.description.length}/{maxLength}
                  </p>
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="animate-spin h-4 w-4 text-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === 'create' ? (
                      <>
                        <PlusIcon className="w-4 h-4" />
                        Create
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        Update
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;