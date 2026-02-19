import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  XMarkIcon, PlusIcon, PencilSquareIcon, CheckIcon,
  ExclamationCircleIcon, CodeBracketIcon,
} from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import axiosInstance from '../../config/axios';

// ─── Preset icons — Restaurant & Food Menu ────────────────────────────────────
const PRESET_ICONS = [
  { label: 'Burger', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 3.75h16.5M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v.75H3.75V6zM3.75 16.5h16.5A2.25 2.25 0 0118 18.75H6A2.25 2.25 0 013.75 16.5z" /></svg>' },
  { label: 'Pizza', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3C7.03 3 3 7.03 3 12l9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l9 9M9 9h.01M13 13h.01" /></svg>' },
  { label: 'Fork & Knife', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 3v4.5c0 1.243.636 2.33 1.6 2.963L9.75 21h1.5l.65-10.537A3.501 3.501 0 0013.5 7.5V3m0 0v4.5m0-4.5h1.5v4.5m-9-4.5H4.5v4.5c0 1.657 1.343 3 3 3v9h1.5" /></svg>' },
  { label: 'Cocktail', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3h4.5L21 9l-9 12L3 9l6.75-6zm0 0L12 9m0 0l2.25-6M12 9v12" /></svg>' },
  { label: 'Coffee', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25V9m7.5 0H6.75m9 0a2.25 2.25 0 012.25 2.25v.75a6 6 0 01-6 6H9a6 6 0 01-6-6v-.75A2.25 2.25 0 015.25 9m10.5 0H6.75M9 3.75h6" /></svg>' },
  { label: 'Dessert / Cake', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3c0 0-3 2-3 4.5S12 9 12 9s3-1.5 3-1.5S12 3 12 3z" /><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 10.5h16.5v2.25a9 9 0 01-9 9h-1.5a9 9 0 01-9-9v-2.25z" /><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 10.5c0-1.243 1.007-2.25 2.25-2.25h12c1.243 0 2.25 1.007 2.25 2.25" /></svg>' },
  { label: 'Salad', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-1.5 3-4.5 4.5-4.5 4.5S9 9 12 9s4.5-1.5 4.5-1.5S13.5 6 12 3z" /><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 9h13.5a1.5 1.5 0 011.5 1.5v1.5a9 9 0 01-9 9h-1.5A9 9 0 013 13.5v-3A1.5 1.5 0 015.25 9z" /></svg>' },
  { label: 'Soup', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5h16.5m-16.5 0A8.25 8.25 0 0012 21.75a8.25 8.25 0 008.25-8.25m-16.5 0H3m18 0h-.75M8.25 7.5c0-1.5.75-3 1.5-3s1.5 1.5 1.5 3m1.5-3c0-1.5.75-3 1.5-3s1.5 1.5 1.5 3" /></svg>' },
  { label: 'BBQ / Grill', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5M12 21v-6m-3 6h6" /><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 9a7.5 7.5 0 0015 0" /><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5c0-1.5 1.5-3 1.5-3s1.5 1.5 1.5 3m1.5-3c0-1.5 1.5-3 1.5-3s1.5 1.5 1.5 3" /></svg>' },
  { label: 'Seafood', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12c0 0 3-6 9-6s9 6 9 6-3 6-9 6-9-6-9-6z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M21 12l2-3m-2 3l2 3" /></svg>' },
  { label: 'Ice Cream', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3a5.25 5.25 0 00-5.25 5.25c0 1.8.9 3.375 2.25 4.32V21l3-2.25L15 21v-8.43a5.217 5.217 0 002.25-4.32A5.25 5.25 0 0012 3z" /></svg>' },
  { label: 'Sandwich', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 7.5h16.5M3.75 10.5h16.5m-16.5 3h16.5M6 4.5h12a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 0118 19.5H6a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 016 4.5z" /></svg>' },
  { label: 'Pasta', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12m18 0c0-4.97-4.03-9-9-9S3 7.03 3 12m18 0H3" /><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 12c0 2.071.784 3.75 1.75 3.75S11.75 14.07 11.75 12 10.966 8.25 10 8.25 8.25 9.929 8.25 12zm5.5 0c0 2.071.784 3.75 1.75 3.75s1.75-1.68 1.75-3.75-.784-3.75-1.75-3.75S13.75 9.929 13.75 12z" /></svg>' },
  { label: 'Breakfast', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="8.25" stroke="currentColor" stroke-width="1.5" fill="none"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.5v1.5m-6-1.5v1.5M4.5 15H3m18 0h-1.5" /></svg>' },
  { label: 'Juice', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3h4.5l1.5 15a2.25 2.25 0 01-2.25 2.25h-3A2.25 2.25 0 018.25 18L9.75 3z" /><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9h4.5M7.5 6h9" /></svg>' },
  { label: 'Wine', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 3h6l2.25 7.5A4.5 4.5 0 0112 15a4.5 4.5 0 01-5.25-4.5L9 3z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v6m-3 0h6" /></svg>' },
  { label: 'Kids Meals', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M11.25 11.25h.008v.008h-.008v-.008zm1.5 0h.008v.008h-.008v-.008zM12 21a9 9 0 110-18 9 9 0 010 18z" /></svg>' },
  { label: 'Specials', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>' },
  { label: 'Vegan', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3C9 6 4.5 7.5 4.5 12c0 4.142 3.358 7.5 7.5 7.5S19.5 16.142 19.5 12c0-4.5-4.5-6-7.5-9z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18" /></svg>' },
  { label: 'Takeaway', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3h10.5L21 9H3l3.75-6zM3 9h18v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V9z" /><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 13.5h4.5" /></svg>' },
  { label: 'Set Menu', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h7.5M8.25 10.5h7.5m-7.5 3.75h4.5M3.75 3h16.5a.75.75 0 01.75.75v16.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V3.75A.75.75 0 013.75 3z" /></svg>' },
  { label: 'Appetizers', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M9 9.75l1.5 1.5L9 12.75m6-3l-1.5 1.5 1.5 1.5m-4.5 2.25h3" /></svg>' },
  { label: 'Sushi', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><ellipse cx="12" cy="12" rx="9" ry="5" stroke="currentColor" stroke-width="1.5" fill="none"/><ellipse cx="12" cy="12" rx="5" ry="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/><path stroke-linecap="round" stroke-linejoin="round" d="M3 12h18" /></svg>' },
  { label: 'Spicy', svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.616a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.465z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.545 5.975 5.975 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>' },
];

// ─── Helper: render SVG string safely ─────────────────────────────────────────
const SvgPreview = ({ svg, className = 'w-6 h-6' }) => {
  if (!svg) return null;
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const CategoryModal = ({ mode, category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', description: '', icon: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [iconTab, setIconTab]   = useState('preset'); // 'preset' | 'custom'
  const maxLength = 1000;

  useEffect(() => {
    if (category && mode === 'edit') {
      setFormData({
        name:        category.name        || '',
        description: category.description || '',
        icon:        category.icon        || '',
      });
      // If the icon matches no preset, switch to custom tab
      const isPreset = PRESET_ICONS.some(p => p.svg === category.icon);
      setIconTab(isPreset ? 'preset' : 'custom');
    }
  }, [category, mode]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim())                          newErrors.name = 'Name is required';
    else if (formData.name.trim().length < 2)           newErrors.name = 'Name must be at least 2 characters';
    else if (formData.name.trim().length > 255)         newErrors.name = 'Name must not exceed 255 characters';
    if (formData.description?.length > maxLength)       newErrors.description = `Description must not exceed ${maxLength} characters`;
    if (!formData.icon.trim())                          newErrors.icon = 'Icon is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const loadingToast = toast.loading(mode === 'create' ? 'Creating category...' : 'Updating category...');

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
        toast.success(mode === 'create'
          ? `Category "${formData.name}" created successfully!`
          : `Category "${formData.name}" updated successfully!`
        );
        onSuccess();
      } else {
        toast.dismiss(loadingToast);
        if (data.errors) setErrors(data.errors);
        else toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      if (error.response?.data?.errors) setErrors(error.response.data.errors);
      else toast.error(error.response?.data?.message || `Failed to ${mode === 'create' ? 'create' : 'update'} category.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
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
                {mode === 'create' ? 'Create Category' : 'Edit Category'}
              </h3>
              <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* Name */}
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
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                    errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-4 h-4" />{errors.name}
                  </p>
                )}
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Icon <span className="text-red-500">*</span>
                </label>

                {/* Tabs */}
                <div className="flex border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden mb-3">
                  <button
                    type="button"
                    onClick={() => setIconTab('preset')}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      iconTab === 'preset'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    Preset Icons
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconTab('custom')}
                    className={`flex-1 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                      iconTab === 'custom'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <CodeBracketIcon className="w-4 h-4" />
                    Custom SVG
                  </button>
                </div>

                {iconTab === 'preset' ? (
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_ICONS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        title={preset.label}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, icon: preset.svg }));
                          if (errors.icon) setErrors(prev => ({ ...prev, icon: '' }));
                        }}
                        className={`aspect-square flex items-center justify-center rounded-xl border-2 transition-all p-2 ${
                          formData.icon === preset.svg
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                        }`}
                      >
                        <SvgPreview svg={preset.svg} className="w-5 h-5 [&>svg]:w-full [&>svg]:h-full" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      name="icon"
                      value={formData.icon}
                      onChange={handleChange}
                      placeholder='Paste your SVG here, e.g. <svg xmlns="..." viewBox="0 0 24 24">...</svg>'
                      rows="4"
                      disabled={loading}
                      className={`focus:outline-none w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none font-mono text-xs ${
                        errors.icon ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {/* Live SVG preview */}
                    {formData.icon && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-200 flex-shrink-0">
                          <SvgPreview svg={formData.icon} className="w-8 h-8 [&>svg]:w-full [&>svg]:h-full" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Live preview</p>
                      </div>
                    )}
                  </div>
                )}

                {errors.icon && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <ExclamationCircleIcon className="w-4 h-4" />{errors.icon}
                  </p>
                )}
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
                  placeholder="Enter category description (optional)"
                  rows="3"
                  maxLength={maxLength}
                  disabled={loading}
                  className={`focus:outline-none w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none max-h-[150px] overflow-y-auto ${
                    errors.description ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <div className="flex items-center justify-between mt-2">
                  {errors.description ? (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <ExclamationCircleIcon className="w-4 h-4" />{errors.description}
                    </p>
                  ) : <span />}
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {(formData.description || '').length}/{maxLength}
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
                  <><ArrowPathIcon className="animate-spin h-4 w-4 text-white" />Processing...</>
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

export default CategoryModal;