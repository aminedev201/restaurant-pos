import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { title } from '../services/helpers';
import DeleteModal from '../components/common/DeleteModal';
import * as XLSX from 'xlsx';
import axiosInstance from '../config/axios';
import { primaryColors } from '../utils/colors';
import TableLoadingSpinner from '../components/common/TableLoadingSpinner';
import {
  MagnifyingGlassIcon,
  TrashIcon,
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
  FunnelIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import ItemModal from '../components/items/ItemModal';
import ShowItemModal from '../components/items/ShowItemModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SvgPreview = ({ svg, className = 'w-4 h-4' }) => {
  if (!svg) return null;
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
};

// ─── Category Filter Dropdown ─────────────────────────────────────────────────
const CategoryFilterSelect = ({ categories, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = categories.find(c => String(c.id) === String(value));

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (cat) => {
    onChange(cat ? String(cat.id) : '');
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative sm:w-56">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full pl-9 pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-gray-700 text-left flex items-center gap-2 cursor-pointer hover:border-primary-400 transition-colors"
      >
        <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        {selected ? (
          <span className="flex items-center gap-2 min-w-0 flex-1">
            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
              <SvgPreview svg={selected.icon} className="w-3.5 h-3.5 [&>svg]:w-full [&>svg]:h-full" />
            </span>
            {/* ← capitalize */}
            <span className="truncate text-gray-900 dark:text-white capitalize">{selected.name}</span>
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 flex-1">All Categories</span>
        )}
        <ChevronDownIcon className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {/* All Categories option */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
              !value
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 text-gray-400">
              <FunnelIcon className="w-4 h-4" />
            </span>
            <span>All Categories</span>
            {!value && <CheckIcon className="w-4 h-4 ml-auto flex-shrink-0 text-primary-600 dark:text-primary-400" />}
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelect(cat)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
                String(cat.id) === String(value)
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                  : 'text-gray-800 dark:text-gray-200'
              }`}
            >
              <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                <SvgPreview svg={cat.icon} className="w-4 h-4 [&>svg]:w-full [&>svg]:h-full" />
              </span>
              {/* ← capitalize */}
              <span className="truncate capitalize">{cat.name}</span>
              {String(cat.id) === String(value) && (
                <CheckIcon className="w-4 h-4 ml-auto flex-shrink-0 text-primary-600 dark:text-primary-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteType, setDeleteType] = useState('single');

  useEffect(() => {
    document.title = title('Items');
    fetchItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedCategoryFilter, items, sortConfig]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/items');
      if (data.success) setItems(data.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get('/categories');
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = () => {
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategoryFilter) {
      filtered = filtered.filter(item =>
        String(item.category_id) === String(selectedCategoryFilter)
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

    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectAll = () => {
    if (selectAll) setSelectedItems([]);
    else setSelectedItems(currentItems.map(item => item.id));
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreate     = () => { setModalMode('create'); setSelectedItem(null); setShowModal(true); };
  const handleEdit       = (item) => { setModalMode('edit'); setSelectedItem(item); setShowModal(true); };
  const handleView       = (item) => { setSelectedItem(item); setShowViewModal(true); };
  const handleDelete     = (item) => { setSelectedItem(item); setDeleteType('single'); setShowDeleteModal(true); };
  const handleBulkDelete = () => {
    if (selectedItems.length === 0) { alert('Please select items to delete'); return; }
    setDeleteType('bulk');
    setShowDeleteModal(true);
  };

  const handleExportExcel = () => {
    if (filteredItems.length === 0) { alert('No data to export'); return; }
    const exportData = filteredItems.map(item => ({
      Title:        item.title,
      Description:  item.description || '',
      Price:        item.price,
      Category:     item.category?.name || '',
      'Created At': new Date(item.created_at).toLocaleDateString(),
      'Updated At': new Date(item.updated_at).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Items');
    XLSX.writeFile(wb, `items_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportWord = () => {
    if (filteredItems.length === 0) { alert('No data to export'); return; }
    const rows = filteredItems.map((item, index) => `
      <tr style="background:${index % 2 === 0 ? '#fff' : '#f9fafb'}">
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${index + 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;text-transform:capitalize;">${item.title}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
          <div style="display:flex;align-items:center;gap:8px;">
            ${item.category?.icon
              ? `<span style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;background:#eff6ff;border-radius:6px;color:#2563eb;">${item.category.icon}</span>`
              : ''}
            <span style="text-transform:capitalize;">${item.category?.name || '-'}</span>
          </div>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">$${Number(item.price).toFixed(2)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.description ? item.description.charAt(0).toUpperCase() + item.description.slice(1).toLowerCase() : '-'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${new Date(item.created_at).toLocaleDateString()}</td>
      </tr>`).join('');

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head><meta charset="utf-8"><title>Items Report</title></head>
      <body style="font-family:Arial,sans-serif;padding:20px;">
        <h1 style="color:${primaryColors[600]};border-bottom:3px solid ${primaryColors[500]};padding-bottom:10px;">Items Report</h1>
        <p style="color:#6b7280;">Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; Total: ${filteredItems.length}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <thead>
            <tr style="background:${primaryColors[500]};color:#fff;">
              <th style="padding:10px 12px;text-align:left;">#</th>
              <th style="padding:10px 12px;text-align:left;">Title</th>
              <th style="padding:10px 12px;text-align:left;">Category</th>
              <th style="padding:10px 12px;text-align:left;">Price</th>
              <th style="padding:10px 12px;text-align:left;">Description</th>
              <th style="padding:10px 12px;text-align:left;">Created</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body></html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `items_${new Date().toISOString().split('T')[0]}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (filteredItems.length === 0) { alert('No data to print'); return; }
    const printContent = `
      <!DOCTYPE html><html>
      <head><title>Items Report</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:Arial,sans-serif;padding:20px;color:#333;}
        .header{margin-bottom:30px;border-bottom:3px solid ${primaryColors[500]};padding-bottom:15px;}
        .header h1{color:${primaryColors[500]};font-size:28px;margin-bottom:5px;}
        .header p{color:#666;font-size:14px;}
        table{width:100%;border-collapse:collapse;margin-top:20px;}
        th{background-color:${primaryColors[500]};color:white;padding:12px;text-align:left;font-size:12px;text-transform:uppercase;}
        td{padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;}
        tr:nth-child(even){background-color:${primaryColors[50]};}
        .price{font-weight:600;color:${primaryColors[700]};}
        .cat-cell{display:flex;align-items:center;gap:8px;}
        .cat-icon{width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:#eff6ff;border-radius:5px;color:#2563eb;}
        .cat-icon svg{width:14px;height:14px;}
        @media print{tr:hover{background-color:inherit;}}
      </style></head>
      <body>
        <div class="header">
          <h1>Items Report</h1>
          <p>Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>Total Records: ${filteredItems.length}</p>
        </div>
        <table>
          <thead><tr>
            <th style="width:40px">#</th>
            <th>Title</th>
            <th>Category</th>
            <th>Price</th>
            <th>Description</th>
            <th>Created</th>
          </tr></thead>
          <tbody>
            ${filteredItems.map((item, i) => `
              <tr>
                <td>${i + 1}</td>
                <td style="font-weight:600;text-transform:capitalize;">${item.title}</td>
                <td>
                  <div class="cat-cell">
                    ${item.category?.icon ? `<div class="cat-icon">${item.category.icon}</div>` : ''}
                    <span style="text-transform:capitalize;">${item.category?.name || '-'}</span>
                  </div>
                </td>
                <td class="price">$${Number(item.price).toFixed(2)}</td>
                <td>${item.description ? item.description.charAt(0).toUpperCase() + item.description.slice(1).toLowerCase() : 'No description'}</td>
                <td>${new Date(item.created_at).toLocaleDateString()}</td>
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
  const indexOfLastItem  = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems     = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages       = Math.ceil(filteredItems.length / itemsPerPage);
  const paginate         = (n) => setCurrentPage(n);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

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
      <div className="">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Items</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your items efficiently</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search + Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                />
              </div>

              {/* Custom category filter with icons */}
              <CategoryFilterSelect
                categories={categories}
                value={selectedCategoryFilter}
                onChange={setSelectedCategoryFilter}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedItems.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                >
                  <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>({selectedItems.length})</span>
                </button>
              )}

              {filteredItems.length > 0 && (
                <>
                  <div className="relative group">
                    <button className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                      <ArrowDownTrayIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                    <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button onClick={handleExportExcel} className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg">Excel</button>
                      <button onClick={handleExportWord}  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg">Word</button>
                    </div>
                  </div>

                  <button
                    onClick={handlePrint}
                    className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                  >
                    <PrinterIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                </>
              )}

              <button
                onClick={handleCreate}
                className="px-3 sm:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition duration-200 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 ml-auto"
              >
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
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <InboxIcon className="w-16 h-16 mb-4 text-gray-400" />
              <p className="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-300">No items found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or create a new item</p>
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
                          checked={selectAll && currentItems.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer accent-red-600"
                        />
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Image
                      </th>
                      <th
                        className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center gap-2">Title <SortIcon columnKey="title" /></div>
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                        Category
                      </th>
                      <th
                        className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors whitespace-nowrap hidden sm:table-cell"
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center gap-2">Price <SortIcon columnKey="price" /></div>
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
                    {currentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer accent-red-600"
                          />
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <img
                            src={item.image_path_url}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=No+Img'; }}
                          />
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          {/* ← capitalize */}
                          <div className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 sm:hidden">
                            ${Number(item.price).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 lg:hidden">
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        {/* Category cell with icon + capitalize */}
                        <td className="px-4 lg:px-6 py-3 lg:py-4 hidden md:table-cell">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 capitalize">
                            {item.category?.icon && (
                              <span
                                className="flex-shrink-0 w-3.5 h-3.5 [&>svg]:w-full [&>svg]:h-full"
                                dangerouslySetInnerHTML={{ __html: item.category.icon }}
                              />
                            )}
                            {item.category?.name || '-'}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 hidden sm:table-cell">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            ${Number(item.price).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 hidden lg:table-cell">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleView(item)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="View">
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleEdit(item)} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Edit">
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(item)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
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
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    >
                      {[5, 10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      entries (Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length})
                    </span>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeftIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>

                      {getPageNumbers().map((number, index) =>
                        number === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400 dark:text-gray-500">...</span>
                        ) : (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                              currentPage === number
                                ? 'bg-primary-600 text-white'
                                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {number}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
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
        <ItemModal
          mode={modalMode}
          item={selectedItem}
          categories={categories}
          onClose={() => { setShowModal(false); setSelectedItem(null); }}
          onSuccess={() => { setShowModal(false); setSelectedItem(null); fetchItems(); }}
        />
      )}
      {showViewModal && (
        <ShowItemModal
          item={selectedItem}
          onClose={() => { setShowViewModal(false); setSelectedItem(null); }}
          onEdit={handleEdit}
        />
      )}
      {showDeleteModal && (
        <DeleteModal
          type={deleteType}
          item={selectedItem}
          selectedIds={selectedItems}
          endpoint="/items"
          entityName="item"
          labelField="title"
          onClose={() => { setShowDeleteModal(false); setSelectedItem(null); }}
          onSuccess={() => {
            setShowDeleteModal(false);
            setSelectedItem(null);
            setSelectedItems([]);
            setSelectAll(false);
            fetchItems();
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default ItemsPage;