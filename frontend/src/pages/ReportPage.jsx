import { useEffect, useState, useCallback, useRef } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { title } from '../services/helpers';
import * as XLSX from 'xlsx';
import axiosInstance from '../config/axios';
import { primaryColors } from '../utils/colors';
import TableLoadingSpinner from '../components/common/TableLoadingSpinner';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsUpDownIcon,
  InboxIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  CalculatorIcon,
  CheckCircleIcon,
  FunnelIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// ── Status colors ─────────────────────────────────────────────────────────────

const statusColors = {
  completed:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const Pill = ({ label, count, type }) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold min-w-[28px] ${statusColors[type]}`}>
      {count}
    </span>
    <span className="text-[10px] text-gray-400 dark:text-gray-500 capitalize">{label}</span>
  </div>
);

// ── Summary Card (top stats) ──────────────────────────────────────────────────

const iconMap = {
  revenue: <BanknotesIcon className="w-6 h-6" />,
  orders:  <ShoppingBagIcon className="w-6 h-6" />,
  avg:     <CalculatorIcon className="w-6 h-6" />,
  rate:    <CheckCircleIcon className="w-6 h-6" />,
};
const cardAccent = {
  revenue: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  orders:  'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  avg:     'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  rate:    'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
};

const SummaryCard = ({ card }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-5 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cardAccent[card.icon] ?? 'bg-gray-100 text-gray-500'}`}>
      {iconMap[card.icon] ?? <BanknotesIcon className="w-6 h-6" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{card.title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">{card.formatted}</p>
      <div className="flex items-center gap-2 mt-1">
        {card.change !== null && card.change !== undefined ? (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${card.isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {card.isPositive ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" /> : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
            {Math.abs(card.change)}%
          </span>
        ) : null}
        <span className="text-xs text-gray-400 dark:text-gray-500">{card.subtitle}</span>
      </div>
    </div>
  </div>
);

// ── Row Card (mobile + tablet only) ──────────────────────────────────────────

const RowCard = ({ row, index }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200">
    {/* Top */}
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{row.label}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{row.period}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{row.revenue_formatted}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">revenue</p>
      </div>
    </div>

    <div className="border-t border-gray-100 dark:border-gray-700" />

    {/* Middle */}
    <div className="grid grid-cols-2 gap-3">
      <div>
        <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">Orders</span>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{row.total_orders}</p>
      </div>
      <div>
        <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">Avg Order</span>
        <p className="text-lg font-bold text-gray-900 dark:text-white">${row.avg_order_value.toFixed(2)}</p>
      </div>
    </div>

    {/* Bottom: status pills */}
    <div className="flex items-center justify-between pt-1">
      <Pill label="Completed"  count={row.completed}  type="completed" />
      <Pill label="Pending"    count={row.pending}    type="pending" />
      <Pill label="Processing" count={row.processing} type="processing" />
      <Pill label="Cancelled"  count={row.cancelled}  type="cancelled" />
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const ReportPage = () => {
  const [rows, setRows]                 = useState([]);
  const [summary, setSummary]           = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [sortConfig, setSortConfig]     = useState({ key: 'period', direction: 'desc' });
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [meta, setMeta]                 = useState({});

  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 29);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo]   = useState(() => new Date().toISOString().split('T')[0]);
  const [groupBy, setGroupBy] = useState('day');
  const [reportType]          = useState('revenue');

  const [groupByOpen, setGroupByOpen] = useState(false);
  const groupByRef = useRef(null);

  useEffect(() => { document.title = title('Reports'); }, []);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/reports', {
        params: { date_from: dateFrom, date_to: dateTo, group_by: groupBy, type: reportType },
      });
      if (data.success) {
        setRows(data.data.rows);
        setSummary(data.data.summary.filter(s => s.key !== 'status_breakdown'));
        setMeta(data.data.meta);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, groupBy, reportType]);

  // Initial fetch
  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear all filters back to defaults
  const handleClear = () => {
    const defaultFrom = new Date();
    defaultFrom.setDate(defaultFrom.getDate() - 29);
    setDateFrom(defaultFrom.toISOString().split('T')[0]);
    setDateTo(new Date().toISOString().split('T')[0]);
    setGroupBy('day');
    setSearchTerm('');
    setSortConfig({ key: 'period', direction: 'desc' });
    setCurrentPage(1);
  };
  useEffect(() => {
    const handler = (e) => {
      if (groupByRef.current && !groupByRef.current.contains(e.target)) setGroupByOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filter + sort
  useEffect(() => {
    let filtered = [...rows];
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.period.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aV = a[sortConfig.key] ?? '';
        let bV = b[sortConfig.key] ?? '';
        if (typeof aV === 'string') { aV = aV.toLowerCase(); bV = bV.toLowerCase(); }
        if (aV < bV) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aV > bV) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    setFilteredRows(filtered);
    setCurrentPage(1);
  }, [searchTerm, rows, sortConfig]);

  const handleSort = (key) => setSortConfig(prev => ({
    key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
  }));

  // Pagination
  const indexOfLast  = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRows  = filteredRows.slice(indexOfFirst, indexOfLast);
  const totalPages   = Math.ceil(filteredRows.length / itemsPerPage);
  const paginate     = (n) => setCurrentPage(n);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else if (currentPage <= 3) { for (let i = 1; i <= 4; i++) pages.push(i); pages.push('...'); pages.push(totalPages); }
    else if (currentPage >= totalPages - 2) { pages.push(1); pages.push('...'); for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i); }
    else { pages.push(1); pages.push('...'); for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i); pages.push('...'); pages.push(totalPages); }
    return pages;
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />;
    return sortConfig.direction === 'asc'
      ? <ChevronUpIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      : <ChevronDownIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />;
  };

  // Totals
  const totals = filteredRows.reduce((acc, r) => ({
    total_orders: acc.total_orders + r.total_orders,
    revenue:      acc.revenue      + r.revenue,
    completed:    acc.completed    + r.completed,
    pending:      acc.pending      + r.pending,
    cancelled:    acc.cancelled    + r.cancelled,
    processing:   acc.processing   + r.processing,
  }), { total_orders: 0, revenue: 0, completed: 0, pending: 0, cancelled: 0, processing: 0 });

  const groupByOptions = [
    { value: 'day',   label: 'Daily',   icon: <CalendarDaysIcon className="w-4 h-4" /> },
    { value: 'week',  label: 'Weekly',  icon: <CalendarDaysIcon className="w-4 h-4" /> },
    { value: 'month', label: 'Monthly', icon: <CalendarDaysIcon className="w-4 h-4" /> },
  ];
  const selectedGroupBy = groupByOptions.find(o => o.value === groupBy);

  const handleExportExcel = () => {
    if (!filteredRows.length) { alert('No data to export'); return; }
    const ws = XLSX.utils.json_to_sheet(filteredRows.map(r => ({
      Period: r.label, 'Total Orders': r.total_orders, Revenue: r.revenue_formatted,
      'Avg Order': '$' + r.avg_order_value.toFixed(2), Completed: r.completed,
      Pending: r.pending, Processing: r.processing, Cancelled: r.cancelled,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `report_${dateFrom}_${dateTo}.xlsx`);
  };
  
  const handleExportWord = () => {
    if (!filteredRows.length) { alert('No data to export'); return; }
    const rowsHtml = filteredRows.map((r, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${r.label}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${r.total_orders}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${r.revenue_formatted}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">$${r.avg_order_value.toFixed(2)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${r.completed}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${r.pending}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${r.cancelled}</td>
      </tr>`).join('');
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"><title>Revenue Report</title></head>
      <body style="font-family:Arial,sans-serif;padding:20px;">
        <h1 style="color:${primaryColors[600]};border-bottom:3px solid ${primaryColors[500]};padding-bottom:10px;">Revenue Report</h1>
        <p style="color:#6b7280;">Period: ${dateFrom} → ${dateTo} | Generated: ${new Date().toLocaleString()} | Rows: ${filteredRows.length}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <thead><tr style="background:${primaryColors[500]};color:#fff;">
            <th style="padding:10px 12px;text-align:left;">Period</th><th style="padding:10px 12px;text-align:right;">Orders</th>
            <th style="padding:10px 12px;text-align:right;">Revenue</th><th style="padding:10px 12px;text-align:right;">Avg Order</th>
            <th style="padding:10px 12px;text-align:center;">Completed</th><th style="padding:10px 12px;text-align:center;">Pending</th>
            <th style="padding:10px 12px;text-align:center;">Cancelled</th>
          </tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `report_${dateFrom}_${dateTo}.doc`; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!filteredRows.length) { alert('No data to print'); return; }
    const content = `<!DOCTYPE html><html><head><title>Revenue Report</title>
    <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;padding:20px;color:#333;}
    .header{margin-bottom:24px;border-bottom:3px solid ${primaryColors[500]};padding-bottom:12px;}
    .header h1{color:${primaryColors[500]};font-size:26px;margin-bottom:4px;}.header p{color:#666;font-size:13px;}
    table{width:100%;border-collapse:collapse;margin-top:16px;}
    th{background:${primaryColors[500]};color:#fff;padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;}
    th.right,td.right{text-align:right;}th.center,td.center{text-align:center;}
    td{padding:9px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;}tr:nth-child(even){background:${primaryColors[50]};}</style></head>
    <body><div class="header"><h1>Revenue Report</h1>
    <p>Period: ${dateFrom} → ${dateTo} | Grouped by: ${groupBy} | Total rows: ${filteredRows.length}</p>
    <p>Generated: ${new Date().toLocaleString()}</p></div>
    <table><thead><tr><th>Period</th><th class="right">Orders</th><th class="right">Revenue</th>
    <th class="right">Avg Order</th><th class="center">Completed</th><th class="center">Pending</th><th class="center">Cancelled</th></tr></thead>
    <tbody>${filteredRows.map(r => `<tr><td>${r.label}</td><td class="right">${r.total_orders}</td>
    <td class="right" style="font-weight:600">${r.revenue_formatted}</td><td class="right">$${r.avg_order_value.toFixed(2)}</td>
    <td class="center">${r.completed}</td><td class="center">${r.pending}</td><td class="center">${r.cancelled}</td></tr>`).join('')}
    </tbody></table></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(content); win.document.close();
    win.onload = () => { win.print(); win.onafterprint = () => win.close(); };
  };

  // ── Shared: Pagination UI ─────────────────────────────────────────────────

  const PaginationBar = () => (
    <div className="bg-gray-50 dark:bg-gray-700 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-600">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Show</span>
          <select
            value={itemsPerPage}
            onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 transition-colors"
          >
            {[5, 10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            entries (Showing {indexOfFirst + 1}–{Math.min(indexOfLast, filteredRows.length)} of {filteredRows.length})
          </span>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeftIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            {getPageNumbers().map((number, idx) =>
              number === '...' ? (
                <span key={`e-${idx}`} className="px-3 py-2 text-gray-400">...</span>
              ) : (
                <button key={number} onClick={() => paginate(number)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    currentPage === number ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}>
                  {number}
                </button>
              )
            )}
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronRightIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Reports</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {meta.date_from && meta.date_to
                ? `Showing data from ${meta.date_from} to ${meta.date_to}`
                : 'Analyse your revenue and order trends'}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        {!loading && summary.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {summary.map(card => <SummaryCard key={card.key} card={card} />)}
          </div>
        )}

        {/* Filters + Actions Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input type="text" placeholder="Search by period label..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Date From */}
              <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
                <CalendarDaysIcon className="w-4 h-4 text-primary-500 dark:text-primary-400 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">From</span>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="text-sm text-gray-900 dark:text-white bg-transparent focus:outline-none cursor-pointer" />
              </div>

              {/* Date To */}
              <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
                <CalendarDaysIcon className="w-4 h-4 text-primary-500 dark:text-primary-400 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">To</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="text-sm text-gray-900 dark:text-white bg-transparent focus:outline-none cursor-pointer" />
              </div>

              {/* Group By */}
              <div className="relative" ref={groupByRef}>
                <button type="button" onClick={() => setGroupByOpen(v => !v)}
                  className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors text-sm text-gray-900 dark:text-white">
                  <span className="w-7 h-7 flex items-center justify-center rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex-shrink-0">
                    <FunnelIcon className="w-4 h-4" />
                  </span>
                  <span className="hidden sm:inline font-medium">{selectedGroupBy?.label ?? 'Group By'}</span>
                  {groupByOpen ? <ChevronUpIcon className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>
                {groupByOpen && (
                  <div className="absolute left-0 z-50 mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
                    {groupByOptions.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => { setGroupBy(opt.value); setGroupByOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20 ${
                          groupBy === opt.value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                        <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">{opt.icon}</span>
                        <span>{opt.label}</span>
                        {groupBy === opt.value && <CheckIcon className="w-4 h-4 ml-auto flex-shrink-0 text-primary-600 dark:text-primary-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Apply */}
              <button onClick={fetchReport}
                className="px-3 sm:px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition duration-200 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                <ArrowTrendingUpIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Apply</span>
              </button>

              {/* Clear */}
              <button
                  onClick={handleClear}
                  className="ml-auto px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg transition duration-200 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                >
                <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Clear</span>
              </button>
              {filteredRows.length > 0 && (
                <>
                 <div className="relative group">
                    <button className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                      <ArrowDownTrayIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                    <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button onClick={handleExportExcel} className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg">Excel</button>
                      <button onClick={handleExportWord} className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg">Word</button>
                    </div>
                  </div>

                  <button onClick={handlePrint}
                    className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                    <PrinterIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <TableLoadingSpinner />
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center py-20">
            <InboxIcon className="w-16 h-16 mb-4 text-gray-400" />
            <p className="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-300">No report data found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting the date range or filters and click Apply</p>
          </div>
        ) : (
          <>
            {/* ── MOBILE + TABLET: Cards (hidden on lg+) ── */}
            <div className="lg:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {currentRows.map((row, i) => (
                  <RowCard key={row.period} row={row} index={indexOfFirst + i} />
                ))}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <PaginationBar />
              </div>
            </div>

            {/* ── DESKTOP: Table (hidden below lg) ── */}
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      {[
                        { key: 'label',           label: 'Period' },
                        { key: 'total_orders',    label: 'Orders' },
                        { key: 'revenue',         label: 'Revenue' },
                        { key: 'avg_order_value', label: 'Avg Order' },
                        { key: 'completed',       label: 'Completed' },
                        { key: 'pending',         label: 'Pending' },
                        { key: 'processing',      label: 'Processing' },
                        { key: 'cancelled',       label: 'Cancelled' },
                      ].map(col => (
                        <th key={col.key} onClick={() => handleSort(col.key)}
                          className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors whitespace-nowrap">
                          <div className="flex items-center gap-2">{col.label} <SortIcon columnKey={col.key} /></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {currentRows.map(row => (
                      <tr key={row.period} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{row.label}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{row.period}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{row.total_orders}</span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{row.revenue_formatted}</span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 dark:text-gray-400">${row.avg_order_value.toFixed(2)}</span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.completed}`}>{row.completed}</span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.pending}`}>{row.pending}</span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.processing}`}>{row.processing}</span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.cancelled}`}>{row.cancelled}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 dark:bg-gray-700 border-t-2 border-gray-300 dark:border-gray-500 font-semibold">
                      <td className="px-4 lg:px-6 py-3 text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wide">Totals</td>
                      <td className="px-4 lg:px-6 py-3 text-sm text-gray-900 dark:text-white">{totals.total_orders}</td>
                      <td className="px-4 lg:px-6 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                        ${totals.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 lg:px-6 py-3 text-sm text-gray-500">—</td>
                      <td className="px-4 lg:px-6 py-3 text-sm text-green-700 dark:text-green-400">{totals.completed}</td>
                      <td className="px-4 lg:px-6 py-3 text-sm text-yellow-700 dark:text-yellow-400">{totals.pending}</td>
                      <td className="px-4 lg:px-6 py-3 text-sm text-blue-700 dark:text-blue-400">{totals.processing}</td>
                      <td className="px-4 lg:px-6 py-3 text-sm text-red-700 dark:text-red-400">{totals.cancelled}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <PaginationBar />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReportPage;