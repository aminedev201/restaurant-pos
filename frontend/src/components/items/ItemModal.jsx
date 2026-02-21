import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  XMarkIcon, PlusIcon, PencilSquareIcon, CheckIcon,
  ExclamationCircleIcon, PhotoIcon, TrashIcon, ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import axiosInstance from '../../config/axios';

const SvgPreview = ({ svg, className = 'w-4 h-4' }) => {
  if (!svg) return null;
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
};

// ─── Custom Category Select ───────────────────────────────────────────────────
const CategorySelect = ({ categories, value, onChange, disabled, error }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = categories.find(c => String(c.id) === String(value));

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (cat) => {
    onChange({ target: { name: 'category_id', value: String(cat.id) } });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(prev => !prev)}
        className={`w-full px-4 py-3 border rounded-lg flex items-center justify-between gap-2 bg-white dark:bg-gray-700 text-left transition-colors focus:outline-none  ${error
            ? 'border-red-500 dark:border-red-500'
            : 'border-gray-300 dark:border-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary-400'}`}
      >
        {selected ? (
          <span className="flex items-center gap-2 min-w-0">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
              <SvgPreview svg={selected.icon} className="w-4 h-4 [&>svg]:w-full [&>svg]:h-full" />
            </span>
            <span className="text-sm text-gray-900 dark:text-white truncate">{selected.name}</span>
          </span>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">Select category</span>
        )}
        <ChevronDownIcon className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {categories.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              No categories available
            </div>
          ) : (
            categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelect(cat)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors ${String(cat.id) === String(value)
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                    : 'text-gray-800 dark:text-gray-200'
                  }`}
              >
                <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  <SvgPreview svg={cat.icon} className="w-4 h-4 [&>svg]:w-full [&>svg]:h-full" />
                </span>
                <span className="truncate">{cat.name}</span>
                {String(cat.id) === String(value) && (
                  <CheckIcon className="w-4 h-4 ml-auto flex-shrink-0 text-primary-600 dark:text-primary-400" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const ItemModal = ({ mode, item, categories = [], onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const maxDescLength = 1000;

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        price: item.price || '',
        category_id: item.category_id || '',
      });
      if (item.image_path_url) setImagePreview(item.image_path_url);
    }
  }, [item, mode]);

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    } else if (formData.title.trim().length > 255) {
      newErrors.title = 'Title must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > maxDescLength) {
      newErrors.description = `Description must not exceed ${maxDescLength} characters`;
    }

    if (!formData.price && formData.price !== 0) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || Number(formData.price) < 0) {
      newErrors.price = 'Price must be a positive number';
    } else if (Number(formData.price) > 99999999.99) {
      newErrors.price = 'Price must be less than or equal to 99,999,999.99';
    } else if (!/^\d+(\.\d{0,2})?$/.test(String(formData.price))) {
      newErrors.price = 'Price can have at most 2 decimal places';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (mode === 'create' && !imageFile) {
      newErrors.image = 'Image is required';
    }

    if (imageFile) {
      const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowed.includes(imageFile.type)) {
        newErrors.image = 'Only JPG, PNG, GIF, WEBP images are allowed';
      } else if (imageFile.size > 10 * 1024 * 1024) {
        newErrors.image = 'Image must not exceed 10MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Only JPG, PNG, GIF, WEBP images are allowed' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image must not exceed 10MB' }));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, image: '' }));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(mode === 'edit' ? item?.image_path_url || null : null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const loadingToast = toast.loading(mode === 'create' ? 'Creating item...' : 'Updating item...');

    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('price', formData.price);
      payload.append('category_id', formData.category_id);
      if (imageFile) payload.append('image', imageFile);
      if (mode === 'edit') payload.append('_method', 'PUT');

      const url = mode === 'create' ? '/items' : `/items/${item.id}`;
      const response = await axiosInstance.post(url, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { data } = response;

      if (data.success) {
        toast.dismiss(loadingToast);
        toast.success(
          mode === 'create'
            ? `Item "${formData.title}" created successfully!`
            : `Item "${formData.title}" updated successfully!`
        );
        onSuccess();
      } else {
        toast.dismiss(loadingToast);
        if (data.errors) setErrors(data.errors);
        else toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || `Failed to ${mode === 'create' ? 'create' : 'update'} item.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-[95vw] sm:max-w-lg mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {mode === 'create' ? <PlusIcon className="w-6 h-6" /> : <PencilSquareIcon className="w-6 h-6" />}
                {mode === 'create' ? 'Create Item' : 'Edit Item'}
              </h3>
              <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6 space-y-4 max-h-[65vh] overflow-y-auto">

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter item title"
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${errors.title ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-4 h-4" />{errors.title}
                  </p>
                )}
              </div>

              {/* Category + Price (side by side) */}
              <div className="grid grid-cols-2 gap-4">
                {/* ── Category with icons ── */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <CategorySelect
                    categories={categories}
                    value={formData.category_id}
                    onChange={handleChange}
                    disabled={loading}
                    error={errors.category_id}
                  />
                  {errors.category_id && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <ExclamationCircleIcon className="w-4 h-4" />{errors.category_id}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    max="99999999.99"
                    step="0.01"
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${errors.price ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                  />
                  {errors.price && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <ExclamationCircleIcon className="w-4 h-4" />{errors.price}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter item description (optional)"
                  rows="3"
                  maxLength={maxDescLength}
                  disabled={loading}
                  className={`focus:outline-none w-full px-4 py-3 border rounded-lg  focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none max-h-[150px] overflow-y-auto ${errors.description ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                />
                <div className="flex items-center justify-between mt-2">
                  {errors.description ? (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <ExclamationCircleIcon className="w-4 h-4" />{errors.description}
                    </p>
                  ) : <span />}
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {formData.description.length}/{maxDescLength}
                  </p>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Image {mode === 'create' && <span className="text-red-500">*</span>}
                  <span className="ml-1 text-xs font-normal text-gray-400">(JPG, PNG, GIF, WEBP — max 10MB)</span>
                </label>

                {imagePreview ? (
                  <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                        >
                          Change
                        </button>
                        {imageFile && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition flex items-center gap-1"
                          >
                            <TrashIcon className="w-3 h-3" /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                    {imageFile && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">New</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className={`w-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center gap-3 transition-colors cursor-pointer ${errors.image
                        ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/10'
                      }`}
                  >
                    <PhotoIcon className={`w-10 h-10 ${errors.image ? 'text-red-400' : 'text-gray-400'}`} />
                    <div className="text-center">
                      <p className={`text-sm font-medium ${errors.image ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        Click to upload an image
                      </p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WEBP up to 10MB</p>
                    </div>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {errors.image && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-4 h-4" />{errors.image}
                  </p>
                )}
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
                ) : mode === 'create' ? (
                  <><PlusIcon className="w-4 h-4" />Create</>
                ) : (
                  <><CheckIcon className="w-4 h-4" />Update</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;