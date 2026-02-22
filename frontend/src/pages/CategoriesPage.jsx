import { useEffect, useState } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { title } from '../services/helpers';
import CategoryModal from '../components/categories/CategoryModal';
import ShowCategoryModal from '../components/categories/ShowCategoryModal';
import DeleteModal from '../components/common/DeleteModal';
import ImportModal from '../components/categories/ImportModal';
import * as XLSX from 'xlsx';
import axiosInstance from '../config/axios';
import { primaryColors } from '../utils/colors';
import TableLoadingSpinner from '../components/common/TableLoadingSpinner';
import {
  MagnifyingGlassIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsUpDownIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { useNavCounts } from '../contexts/NavCountsContext';

const SvgPreview = ({ svg, className = 'w-5 h-5' }) => {
  if (!svg) return null;
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
};

const CategoriesPage = () => {
  const { setNavCount } = useNavCounts();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteType, setDeleteType] = useState('single');

  useEffect(() => {
    document.title = title('Categories');
    fetchCategories();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, categories, sortConfig]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/categories');
      if (data.success) {
        setCategories(data.data);
        setNavCount({ categories: data.data.length }); // ← sync sidebar
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let filtered = [...categories];
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key] || '';
        let bValue = b[sortConfig.key] || '';
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    setFilteredCategories(filtered);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectAll = () => {
    if (selectAll) setSelectedCategories([]);
    else setSelectedCategories(currentCategories.map(cat => cat.id));
    setSelectAll(!selectAll);
  };

  const handleSelectCategory = (id) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]
    );
  };

  const handleCreate = () => { setModalMode('create'); setSelectedCategory(null); setShowModal(true); };
  const handleEdit = (cat) => { setModalMode('edit'); setSelectedCategory(cat); setShowModal(true); };
  const handleView = (cat) => { setSelectedCategory(cat); setShowViewModal(true); };
  const handleDelete = (cat) => { setSelectedCategory(cat); setDeleteType('single'); setShowDeleteModal(true); };
  const handleBulkDelete = () => {
    if (selectedCategories.length === 0) { alert('Please select categories to delete'); return; }
    setDeleteType('bulk');
    setShowDeleteModal(true);
  };

  const handleExportJSON = () => {
    if (filteredCategories.length === 0) { alert('No data to export'); return; }
    const exportData = filteredCategories.map(cat => ({
      name: cat.name,
      description: cat.description,
      icon: cat.icon || '',
      created_at: cat.created_at,
      updated_at: cat.updated_at,
    }));
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const a = document.createElement('a');
    a.setAttribute('href', dataUri);
    a.setAttribute('download', `categories_${new Date().toISOString().split('T')[0]}.json`);
    a.click();
  };

  const handleExportExcel = () => {
    if (filteredCategories.length === 0) { alert('No data to export'); return; }
    const exportData = filteredCategories.map(cat => ({
      Name: cat.name,
      Description: cat.description || '',
      Icon: cat.icon || '',
      'Created At': new Date(cat.created_at).toLocaleDateString(),
      'Updated At': new Date(cat.updated_at).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Categories');
    XLSX.writeFile(wb, `categories_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportWord = () => {
    if (filteredCategories.length === 0) { alert('No data to export'); return; }
    const rows = filteredCategories.map((cat, index) => `
      <tr style="background:${index % 2 === 0 ? '#fff' : '#f9fafb'}">
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${index + 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
          <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:#eff6ff;border-radius:6px;color:#2563eb;">
            ${cat.icon || ''}
          </div>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;text-transform:capitalize;">${cat.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-transform:lowercase;">${cat.description ? cat.description.charAt(0).toUpperCase() + cat.description.slice(1).toLowerCase() : '-'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${new Date(cat.created_at).toLocaleDateString()}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${new Date(cat.updated_at).toLocaleDateString()}</td>
      </tr>`).join('');
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head><meta charset="utf-8"><title>Categories Report</title></head>
      <body style="font-family:Arial,sans-serif;padding:20px;">
        <h1 style="color:${primaryColors[600]};border-bottom:3px solid ${primaryColors[500]};padding-bottom:10px;">Categories Report</h1>
        <p style="color:#6b7280;">Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; Total: ${filteredCategories.length}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <thead><tr style="background:${primaryColors[500]};color:#fff;">
            <th style="padding:10px 12px;text-align:left;">#</th>
            <th style="padding:10px 12px;text-align:left;">Icon</th>
            <th style="padding:10px 12px;text-align:left;">Name</th>
            <th style="padding:10px 12px;text-align:left;">Description</th>
            <th style="padding:10px 12px;text-align:left;">Created</th>
            <th style="padding:10px 12px;text-align:left;">Updated</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories_${new Date().toISOString().split('T')[0]}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (filteredCategories.length === 0) { alert('No data to print'); return; }
    const printContent = `
      <!DOCTYPE html><html>
      <head><title>Categories Report</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:Arial,sans-serif;padding:20px;color:#333;}
        .header{margin-bottom:30px;border-bottom:3px solid ${primaryColors[500]};padding-bottom:15px;}
        .header h1{color:${primaryColors[500]};font-size:28px;margin-bottom:5px;}
        .header p{color:#666;font-size:14px;}
        table{width:100%;border-collapse:collapse;margin-top:20px;}
        th{background-color:${primaryColors[500]};color:white;padding:12px;text-align:left;font-weight:bold;font-size:12px;text-transform:uppercase;}
        td{padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;}
        tr:nth-child(even){background-color:${primaryColors[50]};}
        .icon-cell{width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:${primaryColors[50]};border-radius:6px;color:${primaryColors[500]};}
        .icon-cell svg{width:14px;height:14px;}
        @media print{tr:hover{background-color:inherit;}}
      </style></head>
      <body>
        <div class="header">
          <h1>Categories Report</h1>
          <p>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>Total Records: ${filteredCategories.length}</p>
        </div>
        <table>
          <thead><tr>
            <th style="width:40px">#</th>
            <th style="width:50px">Icon</th>
            <th style="width:22%">Name</th>
            <th style="width:40%">Description</th>
            <th style="width:13%">Created</th>
          </tr></thead>
          <tbody>
            ${filteredCategories.map((cat, i) => `
              <tr>
                <td style="color:#6b7280">${i + 1}</td>
                <td><div class="icon-cell">${cat.icon || ''}</div></td>
                <td style="font-weight:600;text-transform:capitalize;">${cat.name}</td>
                <td style="color:#4b5563;">${cat.description ? cat.description.charAt(0).toUpperCase() + cat.description.slice(1).toLowerCase() : 'No description'}</td>
                <td style="color:#6b7280">${new Date(cat.created_at).toLocaleDateString()}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </body></html>`;
    const win = window.open('', '_blank');
    win.document.write(printContent);
    win.document.close();
    win.onload = () => { win.print(); win.onafterprint = () => win.close(); };
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginate = (n) => setCurrentPage(n);
  const handleItemsPerPageChange = (e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); };

  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pageNumbers.push(i);
      pageNumbers.push('...'); pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1); pageNumbers.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1); pageNumbers.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
      pageNumbers.push('...'); pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUpIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      : <ChevronDownIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />;
  };

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Categories</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your categories efficiently</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg  focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedCategories.length > 0 && (
                <button onClick={handleBulkDelete} className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                  <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>({selectedCategories.length})</span>
                </button>
              )}

              <button onClick={() => setShowImportModal(true)} className="px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                <ArrowUpTrayIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Import</span>
              </button>

              {filteredCategories.length > 0 && (
                <>
                  <div className="relative group">
                    <button className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                      <ArrowDownTrayIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                    <div className="absolute left-0 mt-2 w-40 sm:w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button onClick={handleExportJSON} className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg">JSON</button>
                      <button onClick={handleExportExcel} className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Excel</button>
                      <button onClick={handleExportWord} className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg">Word</button>
                    </div>
                  </div>

                  <button onClick={handlePrint} className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                    <PrinterIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                </>
              )}

              <button onClick={handleCreate} className="px-3 sm:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition duration-200 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 ml-auto">
                <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <TableLoadingSpinner />
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <InboxIcon className="w-16 h-16 mb-4 text-gray-400" />
              <p className="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-300">No categories found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or create a new category</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll && currentCategories.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer accent-red-600"
                        />
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Icon
                      </th>
                      <th
                        className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-2">Name <SortIcon columnKey="name" /></div>
                      </th>
                      <th
                        className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors whitespace-nowrap hidden lg:table-cell"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center gap-2">Created <SortIcon columnKey="created_at" /></div>
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {currentCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => handleSelectCategory(category.id)}
                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer accent-red-600"
                          />
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                            <SvgPreview svg={category.icon} className="w-5 h-5 [&>svg]:w-full [&>svg]:h-full" />
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          {/* ← capitalize */}
                          <div className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                            {category.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 lg:hidden">
                            {new Date(category.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(category.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleView(category)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="View">
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleEdit(category)} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Edit">
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(category)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 dark:bg-gray-700 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white  focus:border-primary-500 transition-colors"
                    >
                      {[5, 10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      entries (Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredCategories.length)} of {filteredCategories.length})
                    </span>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <ChevronLeftIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                      {getPageNumbers().map((number, index) =>
                        number === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400 dark:text-gray-500">...</span>
                        ) : (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${currentPage === number
                                ? 'bg-primary-600 text-white'
                                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                          >
                            {number}
                          </button>
                        )
                      )}
                      <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <ChevronRightIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <CategoryModal
          mode={modalMode}
          category={selectedCategory}
          onClose={() => { setShowModal(false); setSelectedCategory(null); }}
          onSuccess={() => { setShowModal(false); setSelectedCategory(null); fetchCategories(); }}
        />
      )}
      {showViewModal && (
        <ShowCategoryModal
          category={selectedCategory}
          onClose={() => { setShowViewModal(false); setSelectedCategory(null); }}
          onEdit={handleEdit}
        />
      )}
      {showDeleteModal && (
        <DeleteModal
          type={deleteType}
          item={selectedCategory}
          selectedIds={selectedCategories}
          endpoint="/categories"
          entityName="category"
          onClose={() => { setShowDeleteModal(false); setSelectedCategory(null); }}
          onSuccess={() => {
            setShowDeleteModal(false);
            setSelectedCategory(null);
            setSelectedCategories([]);
            setSelectAll(false);
            fetchCategories();
          }}
        />
      )}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => { setShowImportModal(false); fetchCategories(); }}
        />
      )}
    </DashboardLayout>
  );
};

export default CategoriesPage;