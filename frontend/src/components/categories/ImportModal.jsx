import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import axiosInstance from '../../config/axios';
import {
  ArrowUpTrayIcon,
  XMarkIcon,
  InformationCircleIcon,
  CloudArrowUpIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const ImportModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [validationSummary, setValidationSummary] = useState(null);
  const fileInputRef = useRef(null);

  const validateCategory = (category, index) => {
    const errors = [];

    if (!category.name || typeof category.name !== 'string') {
      errors.push(`Row ${index + 1}: Name is required`);
    } else if (category.name.trim().length < 2) {
      errors.push(`Row ${index + 1}: Name must be at least 2 characters`);
    } else if (category.name.trim().length > 255) {
      errors.push(`Row ${index + 1}: Name must not exceed 255 characters`);
    }

    if (category.description && typeof category.description === 'string' && category.description.length > 1000) {
      errors.push(`Row ${index + 1}: Description must not exceed 1000 characters`);
    }

    return errors;
  };

  const parseFile = async (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    try {
      if (fileExtension === 'json') {
        return await parseJSON(file);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        return await parseExcel(file);
      } else {
        throw new Error('Unsupported file type. Please upload JSON or Excel file.');
      }
    } catch (error) {
      throw error;
    }
  };

  const parseJSON = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          if (!Array.isArray(json)) {
            reject(new Error('JSON file must contain an array of categories'));
            return;
          }
          const categories = json.map(item => ({
            name: item.name || item.Name || '',
            description: item.description || item.Description || item.desc || ''
          }));
          resolve(categories);
        } catch (error) {
          reject(new Error('Invalid JSON file format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const parseExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          if (!jsonData || jsonData.length === 0) {
            reject(new Error('Excel file is empty'));
            return;
          }
          const categories = jsonData.map(item => ({
            name: item.name || item.Name || item.NAME || '',
            description: item.description || item.Description || item.DESCRIPTION || item.desc || ''
          }));
          resolve(categories);
        } catch (error) {
          reject(new Error('Invalid Excel file format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      const errorMsg = 'File size must not exceed 5MB';
      setErrors([errorMsg]);
      toast.error(errorMsg);
      return;
    }

    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    if (!['json', 'xlsx', 'xls'].includes(fileExtension)) {
      const errorMsg = 'Only JSON and Excel files are supported';
      setErrors([errorMsg]);
      toast.error(errorMsg);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setPreviewData([]);
    setValidationSummary(null);

    const loadingToast = toast.loading('Validating file...');

    try {
      const categories = await parseFile(selectedFile);
      const allErrors = [];
      categories.forEach((category, index) => {
        const categoryErrors = validateCategory(category, index);
        allErrors.push(...categoryErrors);
      });

      setPreviewData(categories.slice(0, 5));

      if (allErrors.length > 0) {
        setErrors(allErrors);
        toast.dismiss(loadingToast);
        toast.error(`Found ${allErrors.length} validation error${allErrors.length > 1 ? 's' : ''}`);
      } else {
        toast.dismiss(loadingToast);
        toast.success(`File validated successfully! ${categories.length} categories ready to import`);
      }

      setValidationSummary({
        total: categories.length,
        valid: categories.length - allErrors.length,
        invalid: allErrors.length
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      setErrors([error.message]);
      setFile(null);
      toast.error(error.message);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      const errorMsg = 'Please select a file to import';
      setErrors([errorMsg]);
      toast.error(errorMsg);
      return;
    }

    if (errors.length > 0) {
      toast.error('Please fix validation errors before importing');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Importing categories...');

    try {
      const categories = await parseFile(file);
      const response = await axiosInstance.post('/categories/import', { categories });
      const { data } = response;

      if (data.success) {
        toast.dismiss(loadingToast);
        const successCount = data.imported || categories.length;
        const skippedCount = data.skipped || 0;

        if (skippedCount > 0) {
          toast.success(
            `Successfully imported ${successCount} categories! ${skippedCount} duplicates were skipped.`,
            { duration: 5000 }
          );
        } else {
          toast.success(`Successfully imported ${successCount} categories!`, { duration: 4000 });
        }
        onSuccess();
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.dismiss(loadingToast);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        setErrors(errorMessages);
        toast.error(`Import failed: ${errorMessages[0]}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to import categories. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ArrowUpTrayIcon className="w-6 h-6" />
                Import Categories
              </h3>
              <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5" />
                Import Instructions
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Required field: <span className="font-semibold">name</span> (min 2, max 255 characters)</li>
                <li>• Optional field: <span className="font-semibold">description</span> (max 1000 characters)</li>
                <li>• Maximum file size: 5MB</li>
                <li>• Duplicate names will be skipped</li>
              </ul>
            </div>

            {/* File Upload Area */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.xlsx,.xls"
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="hidden"
              />

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
                }`}
              >
                <CloudArrowUpIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                {file ? (
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                    >
                      Choose different file
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Drop your file here</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">or</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                    >
                      Browse Files
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                      Supported: JSON, Excel (XLSX, XLS)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Validation Summary */}
            {validationSummary && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{validationSummary.total}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Records</p>
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{validationSummary.valid}</p>
                  <p className="text-sm text-primary-600 dark:text-primary-400">Valid</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{validationSummary.invalid}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">Invalid</p>
                </div>
              </div>
            )}

            {/* Preview Data */}
            {previewData.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Preview (First 5 records)
                </h4>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">#</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {previewData.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{index + 1}</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-white font-medium">{item.name || 'N/A'}</td>
                            <td className="px-4 py-2 text-gray-600 dark:text-gray-400 truncate max-w-xs">{item.description || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
                      Validation Errors ({errors.length})
                    </h4>
                    <div className="max-h-32 overflow-y-auto">
                      <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
                        {errors.slice(0, 10).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {errors.length > 10 && (
                          <li className="text-red-600 dark:text-red-400 font-medium">
                            ... and {errors.length - 10} more errors
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              onClick={handleImport}
              disabled={loading || !file || errors.length > 0}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                 <LoadingSpinner size="sm" />
                  Importing...
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  Import Categories
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;