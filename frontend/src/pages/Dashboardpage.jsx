import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { title } from '../services/helpers';
import axiosInstance from '../config/axios';
import { ROUTES } from '../config/routes';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  ShoppingCartIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_BADGE = {
  pending:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  processing: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
  completed:  'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
  cancelled:  'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
};

const PAYMENT_BADGE = {
  paid:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  unpaid:   'bg-gray-100  text-gray-600  dark:bg-gray-700     dark:text-gray-400',
  refunded: 'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400',
};

const CARD_ICONS = {
  orders:  ShoppingCartIcon,
  revenue: CurrencyDollarIcon,
  items:   CubeIcon,
  pending: ClockIcon,
};

const CARD_COLORS = {
  orders:  'from-primary-500 to-primary-600',
  revenue: 'from-emerald-500 to-emerald-600',
  items:   'from-violet-500  to-violet-600',
  pending: 'from-amber-500   to-amber-600',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="w-12 h-4 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
    <div className="w-20 h-3 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
    <div className="w-28 h-8 rounded bg-gray-200 dark:bg-gray-700" />
  </div>
);

const SkeletonChart = ({ h = 'h-72' }) => (
  <div className={`${h} rounded-xl bg-gray-100 dark:bg-gray-700/50 animate-pulse`} />
);

const StatCard = ({ card }) => {
  const Icon = CARD_ICONS[card.icon] ?? ShoppingCartIcon;
  const gradient = CARD_COLORS[card.icon] ?? 'from-primary-500 to-primary-600';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {card.change !== null && card.change !== undefined ? (
          <div className={`flex items-center gap-1 text-sm font-semibold ${card.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {card.isPositive
              ? <ArrowTrendingUpIcon className="w-4 h-4" />
              : <ArrowTrendingDownIcon className="w-4 h-4" />
            }
            {Math.abs(card.change)}%
          </div>
        ) : null}
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{card.title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.formatted}</p>
      {card.subtitle && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{card.subtitle}</p>
      )}
    </div>
  );
};

// Custom tooltip for revenue chart
const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      <p className="text-primary-600 dark:text-primary-400 font-bold">
        ${payload[0]?.value?.toFixed(2)}
      </p>
    </div>
  );
};

// Custom tooltip for orders chart
const OrdersTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="capitalize text-gray-600 dark:text-gray-400">{p.dataKey}:</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get('/stats');
      if (data.success) setStats(data.data);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = title('Dashboard');
    fetchStats();
  }, [fetchStats]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Restaurant POS Dashboard 
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monitor orders, track sales, manage tables, and oversee your restaurant operations in real time.
            </p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300
              bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
              rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* ── Error ──────────────────────────────────────────────────────── */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-3">
            <span>⚠️ {error}</span>
            <button onClick={fetchStats} className="ml-auto underline hover:no-underline">Retry</button>
          </div>
        )}

        {/* ── Stat Cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : stats?.cards?.map(card => <StatCard key={card.key} card={card} />)
          }
        </div>

        {/* ── Charts Row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Revenue Area Chart */}
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Revenue</h2>
                <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
              </div>
              <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
            </div>

            {loading ? <SkeletonChart h="h-64" /> : (
              <ResponsiveContainer width="100%" height={256}>
                <AreaChart data={stats?.revenue_chart ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:[stroke:#374151]" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#revenueGrad)"
                    dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#6366f1' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Orders Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Orders</h2>
                <p className="text-xs text-gray-400 mt-0.5">Last 7 days by status</p>
              </div>
              <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <ShoppingCartIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            {loading ? <SkeletonChart h="h-64" /> : (
              <ResponsiveContainer width="100%" height={256}>
                <BarChart data={stats?.orders_chart ?? []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:[stroke:#374151]" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<OrdersTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                  <Bar dataKey="completed"  fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="pending"    fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="cancelled"  fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Bottom Row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Recent Orders Table */}
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
                <p className="text-xs text-gray-400 mt-0.5">Latest 5 orders</p>
              </div>
              <button
                onClick={() => navigate(ROUTES.ORDERS ?? '/orders')}
                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                View all →
              </button>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
                ))}
              </div>
            ) : !stats?.recent_orders?.length ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                <ShoppingCartIcon className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Order</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Payment</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {stats.recent_orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-3">
                          <p className="font-medium text-gray-900 dark:text-white">{order.order_number}</p>
                          <p className="text-xs text-gray-400">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${PAYMENT_BADGE[order.payment_status]}`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-white">
                          ${order.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <FireIcon className="w-4 h-4 text-orange-500" />
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Top Items</h2>
                <p className="text-xs text-gray-400 mt-0.5">Best sellers by quantity</p>
              </div>
            </div>

            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
                ))}
              </div>
            ) : !stats?.top_items?.length ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                <CubeIcon className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">No sales data yet</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {stats.top_items.map((item, idx) => {
                  const maxQty  = stats.top_items[0]?.total_qty ?? 1;
                  const pct     = Math.round((item.total_qty / maxQty) * 100);
                  return (
                    <div key={item.item_id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0">#{idx + 1}</span>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.title}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                          ×{item.total_qty}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">${item.total_revenue.toFixed(2)} revenue</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;