import { useState } from 'react';
import { PrinterIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  statusStyles,
  paymentStatusStyles,
  paymentMethodStyles,
  StatusIcon,
  PaymentMethodIcon,
} from './OrderConstants';

// ─── OrderItemsModal ──────────────────────────────────────────────────────────
// Props:
//   order                 : full order object
//   onClose               : () => void
//   onUpdateStatus        : (id, status) => Promise<void>
//   onUpdatePaymentStatus : (id, paymentStatus) => Promise<void>
//   onUpdatePaymentMethod : (id, paymentMethod) => Promise<void>
//   onShowBill            : (order, items) => void

const OrderItemsModal = ({
  order,
  onClose,
  onUpdateStatus,
  onUpdatePaymentStatus,
  onUpdatePaymentMethod,
  onShowBill,
}) => {
  const [statusLoading, setStatusLoading] = useState(false);
  const [payLoading,    setPayLoading]    = useState(false);
  const [methodLoading, setMethodLoading] = useState(false);

  if (!order) return null;

  const items    = order.order_items || order.orderItems || [];
  const subtotal = Number(order.subtotal || items.reduce((s, i) => s + Number(i.total), 0));

  const handleStatus = async (newStatus) => {
    setStatusLoading(true);
    await onUpdateStatus(order.id, newStatus);
    setStatusLoading(false);
  };

  const handlePayStatus = async (newStatus) => {
    setPayLoading(true);
    await onUpdatePaymentStatus(order.id, newStatus);
    setPayLoading(false);
  };

  const handlePayMethod = async (newMethod) => {
    setMethodLoading(true);
    await onUpdatePaymentMethod(order.id, newMethod);
    setMethodLoading(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col"
        style={{ animation: 'modalIn 0.2s ease-out' }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-xs font-semibold text-primary-500 uppercase tracking-widest">Order Details</p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">#{order.order_number}</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0 space-y-5">

          {/* Status Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Order Status */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Order Status
              </p>
              <div className="flex flex-col gap-1">
                {ORDER_STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatus(s)}
                    disabled={statusLoading || order.status === s}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all focus:outline-none disabled:cursor-not-allowed w-full justify-start ${
                      order.status === s
                        ? `${statusStyles[s]} ring-2 ring-offset-1 ring-current`
                        : 'bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {statusLoading && order.status === s
                      ? <ArrowPathIcon className="w-3 h-3 animate-spin" />
                      : <StatusIcon status={s} />
                    }
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Payment Status
              </p>
              <div className="flex flex-col gap-1">
                {PAYMENT_STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => handlePayStatus(s)}
                    disabled={payLoading || order.payment_status === s}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all focus:outline-none disabled:cursor-not-allowed w-full justify-start ${
                      order.payment_status === s
                        ? `${paymentStatusStyles[s]} ring-2 ring-offset-1 ring-current`
                        : 'bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {payLoading && order.payment_status === s
                      ? <ArrowPathIcon className="w-3 h-3 animate-spin" />
                      : null
                    }
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Payment Method
              </p>
              <div className="flex flex-col gap-1">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m}
                    onClick={() => handlePayMethod(m)}
                    disabled={methodLoading || order.payment_method === m}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all focus:outline-none disabled:cursor-not-allowed w-full justify-start ${
                      order.payment_method === m
                        ? `${paymentMethodStyles[m]} ring-2 ring-offset-1 ring-current`
                        : 'bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {methodLoading && order.payment_method === m
                      ? <ArrowPathIcon className="w-3 h-3 animate-spin" />
                      : <PaymentMethodIcon method={m} />
                    }
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Order Items ({items.length})
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Item</th>
                    <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Price</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">
                        No items found
                      </td>
                    </tr>
                  ) : items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-600/50 last:border-0">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          {item.item?.image_path && (
                            <img
                              src={item.item.image_path}
                              alt={item.title}
                              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">
                            {item.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center text-sm text-gray-600 dark:text-gray-400">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm text-gray-600 dark:text-gray-400">
                        {Number(item.price).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        {Number(item.total).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span>{Number(order.subtotal || subtotal).toLocaleString()} USD</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <span>Discount</span>
                <span>- {Number(order.discount).toLocaleString()} USD</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Tax</span>
              <span>{Number(order.tax || 0).toLocaleString()} USD</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-600">
              <span>Total</span>
              <span className="text-primary-600 dark:text-primary-400">
                {Number(order.total).toLocaleString()} USD
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none"
          >
            <XMarkIcon className="w-4 h-4" />
            Close
          </button>
          <button
            onClick={() => onShowBill(order, items)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white text-sm font-bold transition-colors shadow-lg shadow-primary-200 dark:shadow-primary-900/30 focus:outline-none"
          >
            <PrinterIcon className="w-4 h-4" />
            Print Bill
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
};

export default OrderItemsModal;