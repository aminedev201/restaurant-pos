import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { title } from '../services/helpers';
import * as XLSX from 'xlsx';
import axiosInstance from '../config/axios';
import { primaryColors } from '../utils/colors';
import TableLoadingSpinner from '../components/common/TableLoadingSpinner';
import { toast } from 'react-hot-toast';
import BillModal from '../components/menu/BillModal';
import OrderItemsModal from '../components/orders/OrderItemsModal';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  EyeIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsUpDownIcon,
  FunnelIcon,
  CheckIcon,
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  statusStyles,
  paymentStatusStyles,
  paymentMethodStyles,
  StatusIcon,
  PaymentMethodIcon,
} from '../components/orders/OrderConstants';


// ─── Generic Filter Select ────────────────────────────────────────────────────
const FilterSelect = ({ value, onChange, options, placeholder, icon: Icon }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative sm:w-44">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full pl-9 pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left flex items-center gap-2 cursor-pointer hover:border-primary-400 transition-colors focus:outline-none"
      >
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        )}
        <span className={`flex-1 truncate ${value ? 'text-gray-900 dark:text-white capitalize' : 'text-gray-400 dark:text-gray-500'}`}>
          {value || placeholder}
        </span>
        <ChevronDownIcon className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
              !value
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-700 text-gray-400">
              <FunnelIcon className="w-3.5 h-3.5" />
            </span>
            <span className="flex-1">{placeholder}</span>
            {!value && <CheckIcon className="w-4 h-4 ml-auto flex-shrink-0 text-primary-500" />}
          </button>
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20 capitalize ${
                value === opt
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                  : 'text-gray-800 dark:text-gray-200'
              }`}
            >
              <span className="flex-1 capitalize">{opt}</span>
              {value === opt && <CheckIcon className="w-4 h-4 ml-auto flex-shrink-0 text-primary-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Inline Action Select ─────────────────────────────────────────────────────
const InlineSelect = ({ value, options, styles, onChange, loading, icons }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(p => !p)}
        disabled={loading}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize transition-all ${styles[value] || 'bg-gray-100 text-gray-600'} hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : icons?.[value]}
        {value}
        <ChevronDownIcon className={`w-3 h-3 ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden min-w-[130px]">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold capitalize transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                opt === value ? `${styles[opt]} opacity-80` : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {icons?.[opt]}
              {opt}
              {opt === value && <CheckIcon className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main OrdersPage ──────────────────────────────────────────────────────────
const OrdersPage = () => {
  const [orders, setOrders]                   = useState([]);
  const [filteredOrders, setFilteredOrders]   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [searchTerm, setSearchTerm]           = useState('');
  const [filterStatus, setFilterStatus]       = useState('');
  const [filterPayStatus, setFilterPayStatus] = useState('');
  const [filterPayMethod, setFilterPayMethod] = useState('');
  const [sortConfig, setSortConfig]           = useState({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage]         = useState(1);
  const [itemsPerPage, setItemsPerPage]       = useState(5);
  const [viewOrder, setViewOrder]             = useState(null);
  const [updatingId, setUpdatingId]           = useState(null);

  // ── Shared bill modal state (same pattern as MenuPage) ────────────────────
  const [billOpen, setBillOpen]       = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    document.title = title('Orders');
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterStatus, filterPayStatus, filterPayMethod, orders, sortConfig]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/orders');
      if (data.success) {
        setOrders(data.data?.data || data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...orders];

    if (searchTerm) {
      const raw        = searchTerm.trim().toLowerCase();
      const normalized = raw.startsWith('ord-') ? raw : `ord-${raw}`;
      result = result.filter(o =>
        o.order_number?.toLowerCase().includes(normalized) ||
        o.order_number?.toLowerCase().includes(raw)
      );
    }
    if (filterStatus)    result = result.filter(o => o.status === filterStatus);
    if (filterPayStatus) result = result.filter(o => o.payment_status === filterPayStatus);
    if (filterPayMethod) result = result.filter(o => o.payment_method === filterPayMethod);

    if (sortConfig.key) {
      result.sort((a, b) => {
        let av = a[sortConfig.key] ?? '';
        let bv = b[sortConfig.key] ?? '';
        if (typeof av === 'string') av = av.toLowerCase();
        if (typeof bv === 'string') bv = bv.toLowerCase();
        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredOrders(result);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // ── Optimistic local update ───────────────────────────────────────────────
  const updateOrderLocally = (id, patch) => {
    const apply = list => list.map(o => o.id === id ? { ...o, ...patch } : o);
    setOrders(prev => apply(prev));
    setViewOrder(prev => prev?.id === id ? { ...prev, ...patch } : prev);
  };

  // ── API update handlers ───────────────────────────────────────────────────
  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const { data } = await axiosInstance.patch(`/orders/${id}/status`, { status });
      if (data.success) { updateOrderLocally(id, { status }); toast.success('Order status updated'); }
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  const handleUpdatePaymentStatus = async (id, payment_status) => {
    setUpdatingId(id);
    try {
      const { data } = await axiosInstance.patch(`/orders/${id}/payment`, { payment_status });
      if (data.success) { updateOrderLocally(id, { payment_status }); toast.success('Payment status updated'); }
    } catch { toast.error('Failed to update payment status'); }
    finally { setUpdatingId(null); }
  };

  const handleUpdatePaymentMethod = async (id, payment_method) => {
    setUpdatingId(id);
    try {
      const { data } = await axiosInstance.patch(`/orders/${id}/payment`, { payment_method });
      if (data.success) { updateOrderLocally(id, { payment_method }); toast.success('Payment method updated'); }
    } catch { toast.error('Failed to update payment method'); }
    finally { setUpdatingId(null); }
  };

  // ── Open shared BillModal ─────────────────────────────────────────────────
  const handleShowBill = (order, items) => {
    setPlacedOrder({ order, items });
    setBillOpen(true);
  };

  // ── Export helpers ────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    if (!filteredOrders.length) { toast.error('No data to export'); return; }
    const rows = filteredOrders.map(o => ({
      'Order':          o.order_number,
      'Status':         o.status,
      'Payment Status': o.payment_status,
      'Payment Method': o.payment_method,
      'Subtotal':       Number(o.subtotal),
      'Tax':            Number(o.tax || 0),
      'Discount':       Number(o.discount || 0),
      'Total':          Number(o.total),
      'Created At':     new Date(o.created_at).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    XLSX.writeFile(wb, `orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportWord = () => {
    if (!filteredOrders.length) { toast.error('No data to export'); return; }
    const rows = filteredOrders.map((o, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${i + 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;">${o.order_number}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-transform:capitalize;">${o.status}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-transform:capitalize;">${o.payment_status}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-transform:capitalize;">${o.payment_method}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;">${Number(o.total).toLocaleString()} USD</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${new Date(o.created_at).toLocaleDateString()}</td>
      </tr>`).join('');

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head><meta charset="utf-8"><title>Orders Report</title></head>
      <body style="font-family:Arial,sans-serif;padding:20px;">
        <h1 style="color:${primaryColors[600]};border-bottom:3px solid ${primaryColors[500]};padding-bottom:10px;">Orders Report</h1>
        <p style="color:#6b7280;">Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; Total: ${filteredOrders.length}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <thead>
            <tr style="background:${primaryColors[500]};color:#fff;">
              <th style="padding:10px 12px;text-align:left;">#</th>
              <th style="padding:10px 12px;text-align:left;">Order</th>
              <th style="padding:10px 12px;text-align:left;">Status</th>
              <th style="padding:10px 12px;text-align:left;">Payment Status</th>
              <th style="padding:10px 12px;text-align:left;">Method</th>
              <th style="padding:10px 12px;text-align:left;">Total</th>
              <th style="padding:10px 12px;text-align:left;">Created</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `orders_${new Date().toISOString().split('T')[0]}.doc`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!filteredOrders.length) { toast.error('No data to print'); return; }
    const content = `<!DOCTYPE html><html>
    <head><title>Orders Report</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:Arial,sans-serif;padding:20px;color:#333;}
      .header{margin-bottom:24px;border-bottom:3px solid ${primaryColors[500]};padding-bottom:12px;}
      .header h1{color:${primaryColors[500]};font-size:26px;margin-bottom:4px;}
      .header p{color:#6b7280;font-size:13px;}
      table{width:100%;border-collapse:collapse;margin-top:16px;}
      th{background:${primaryColors[500]};color:#fff;padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;}
      td{padding:9px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;}
      tr:nth-child(even){background:${primaryColors[50]};}
      .badge{display:inline-block;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:600;text-transform:capitalize;}
      .status-pending{background:#fef9c3;color:#a16207;}
      .status-processing{background:#dbeafe;color:#1d4ed8;}
      .status-completed{background:#dcfce7;color:#166534;}
      .status-cancelled{background:#fee2e2;color:#991b1b;}
      .pay-unpaid{background:#fee2e2;color:#991b1b;}
      .pay-paid{background:#dcfce7;color:#166534;}
      .pay-refunded{background:#f3f4f6;color:#374151;}
      @media print{tr:hover{background:inherit;}}
    </style></head>
    <body>
      <div class="header">
        <h1>Orders Report</h1>
        <p>Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; Total: ${filteredOrders.length} orders</p>
      </div>
      <table>
        <thead><tr>
          <th>#</th><th>Order</th><th>Status</th><th>Payment</th><th>Method</th><th>Total</th><th>Created</th>
        </tr></thead>
        <tbody>
          ${filteredOrders.map((o, i) => `
            <tr>
              <td>${i + 1}</td>
              <td style="font-weight:700;">${o.order_number}</td>
              <td><span class="badge status-${o.status}">${o.status}</span></td>
              <td><span class="badge pay-${o.payment_status}">${o.payment_status}</span></td>
              <td style="text-transform:capitalize;">${o.payment_method}</td>
              <td style="font-weight:700;color:${primaryColors[700]};">${Number(o.total).toLocaleString()} USD</td>
              <td>${new Date(o.created_at).toLocaleDateString()}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </body></html>`;
    const win = window.open('', '_blank');
    win.document.write(content);
    win.document.close();
    win.onload = () => { win.print(); win.onafterprint = () => win.close(); };
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  const indexOfLast   = currentPage * itemsPerPage;
  const indexOfFirst  = indexOfLast - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);
  const totalPages    = Math.ceil(filteredOrders.length / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      [1, 2, 3, 4, '...', totalPages].forEach(p => pages.push(p));
    } else if (currentPage >= totalPages - 2) {
      [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages].forEach(p => pages.push(p));
    } else {
      [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages].forEach(p => pages.push(p));
    }
    return pages;
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUpIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      : <ChevronDownIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />;
  };

  const hasFilters = searchTerm || filterStatus || filterPayStatus || filterPayMethod;

  return (
    <DashboardLayout>
      <div>

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Orders</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage and track all orders</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {ORDER_STATUSES.map(s => {
              const count = orders.filter(o => o.status === s).length;
              if (!count) return null;
              return (
                <span key={s} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[s]}`}>
                  <StatusIcon status={s} />{s} {count}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── Actions Bar ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col gap-3 sm:gap-4">

            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none hover:border-primary-400 transition-colors"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              <FilterSelect value={filterStatus}    onChange={setFilterStatus}    options={ORDER_STATUSES}   placeholder="All Statuses"   icon={FunnelIcon} />
              <FilterSelect value={filterPayStatus} onChange={setFilterPayStatus} options={PAYMENT_STATUSES} placeholder="Payment Status"  icon={CreditCardIcon} />
              <FilterSelect value={filterPayMethod} onChange={setFilterPayMethod} options={PAYMENT_METHODS}  placeholder="Payment Method"  icon={BanknotesIcon} />

              {hasFilters && (
                <button
                  onClick={() => { setSearchTerm(''); setFilterStatus(''); setFilterPayStatus(''); setFilterPayMethod(''); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-300 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" /> Clear
                </button>
              )}
            </div>

            {filteredOrders.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative group">
                  <button className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                    <ArrowDownTrayIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                  <div className="absolute left-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button onClick={handleExportExcel} className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg">Excel</button>
                    <button onClick={handleExportWord}  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg">Word</button>
                  </div>
                </div>

                <button
                  onClick={handlePrint}
                  className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                >
                  <PrinterIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                  {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <TableLoadingSpinner />
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ShoppingBagIcon className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-300">No orders found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hasFilters ? 'Try adjusting your filters' : 'No orders have been placed yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors whitespace-nowrap" onClick={() => handleSort('order_number')}>
                        <div className="flex items-center gap-2">Order <SortIcon columnKey="order_number" /></div>
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Status</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Payment</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Method</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors whitespace-nowrap hidden lg:table-cell" onClick={() => handleSort('created_at')}>
                        <div className="flex items-center gap-2">Created <SortIcon columnKey="created_at" /></div>
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {currentOrders.map(order => {
                      const isUpdating = updatingId === order.id;
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">

                          <td className="px-4 lg:px-6 py-3 lg:py-4">
                            <div className="font-bold text-sm text-gray-900 dark:text-white">{order.order_number}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 lg:hidden">
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 sm:hidden">
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-semibold ${paymentStatusStyles[order.payment_status]}`}>
                                {order.payment_status}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 lg:px-6 py-3 lg:py-4">
                            <InlineSelect
                              value={order.status}
                              options={ORDER_STATUSES}
                              styles={statusStyles}
                              loading={isUpdating}
                              icons={{
                                pending:    <ClockIcon className="w-3 h-3" />,
                                processing: <ArrowPathIcon className="w-3 h-3" />,
                                completed:  <CheckCircleIcon className="w-3 h-3" />,
                                cancelled:  <XCircleIcon className="w-3 h-3" />,
                              }}
                              onChange={val => handleUpdateStatus(order.id, val)}
                            />
                          </td>

                          <td className="px-4 lg:px-6 py-3 lg:py-4 hidden sm:table-cell">
                            <InlineSelect
                              value={order.payment_status}
                              options={PAYMENT_STATUSES}
                              styles={paymentStatusStyles}
                              loading={isUpdating}
                              onChange={val => handleUpdatePaymentStatus(order.id, val)}
                            />
                          </td>

                          <td className="px-4 lg:px-6 py-3 lg:py-4 hidden md:table-cell">
                            <InlineSelect
                              value={order.payment_method}
                              options={PAYMENT_METHODS}
                              styles={paymentMethodStyles}
                              loading={isUpdating}
                              icons={{
                                cash:   <PaymentMethodIcon method="cash" />,
                                card:   <PaymentMethodIcon method="card" />,
                                mobile: <PaymentMethodIcon method="mobile" />,
                              }}
                              onChange={val => handleUpdatePaymentMethod(order.id, val)}
                            />
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 hidden lg:table-cell">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>

                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => setViewOrder(order)}
                                className="p-2 text-primary-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="View order details"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ── */}
              <div className="bg-gray-50 dark:bg-gray-700 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 transition-colors focus:outline-none"
                    >
                      {[5, 10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      entries (Showing {indexOfFirst + 1}–{Math.min(indexOfLast, filteredOrders.length)} of {filteredOrders.length})
                    </span>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => p - 1)}
                        disabled={currentPage === 1}
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeftIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>

                      {getPageNumbers().map((num, idx) =>
                        num === '...' ? (
                          <span key={`e-${idx}`} className="px-2 py-2 text-gray-400 dark:text-gray-500 text-sm">...</span>
                        ) : (
                          <button
                            key={num}
                            onClick={() => setCurrentPage(num)}
                            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                              currentPage === num
                                ? 'bg-primary-600 text-white'
                                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {num}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => setCurrentPage(p => p + 1)}
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

      {/* ── Order Details Modal — extracted to src/components/orders/OrderItemsModal.jsx ── */}
      {viewOrder && (
        <OrderItemsModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePaymentStatus={handleUpdatePaymentStatus}
          onUpdatePaymentMethod={handleUpdatePaymentMethod}
          onShowBill={handleShowBill}
        />
      )}

      {/* ── Shared Bill Modal — same component used by MenuPage ── */}
      <BillModal
        isOpen={billOpen}
        onClose={() => setBillOpen(false)}
        order={placedOrder?.order}
        items={placedOrder?.items || []}
      />
    </DashboardLayout>
  );
};

export default OrdersPage;