import { PrinterIcon } from '@heroicons/react/24/outline';

// ─── Bill — Printable receipt layout ─────────────────────────────────────────
// Props:
//   order       : { order_number, payment_method, discount, tax, created_at,
//                   status, payment_status, subtotal, total }
//   items       : [{ title, quantity, price, total }]

const Bill = ({ order, items }) => {
  if (!order) return null;

  const subtotal = Number(order.subtotal || 0);
  const tax      = Number(order.tax      || 0);
  const discount = Number(order.discount || 0);
  const total    = Number(order.total    || 0);

  const date = order.created_at
    ? new Date(order.created_at).toLocaleString()
    : new Date().toLocaleString();

  return (
    <div id="bill-print-area" className="font-mono text-xs text-gray-800 dark:text-gray-200 w-full">

      {/* ── Header ── */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <PrinterIcon className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
            Receipt
          </span>
        </div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          Bill: #{order.order_number}
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{date}</p>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-3" />

      {/* ── Items Table ── */}
      <div className="w-full">
        {/* Header row */}
        <div className="grid grid-cols-12 text-gray-400 dark:text-gray-500 font-semibold text-xs pb-2 border-b border-gray-200 dark:border-gray-700 uppercase tracking-wide">
          <span className="col-span-5">Item</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-2 text-right">Price</span>
          <span className="col-span-3 text-right">Total</span>
        </div>

        {/* Item rows */}
        {items.map((item, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 py-2.5 border-b border-dashed border-gray-100 dark:border-gray-700/60 items-start last:border-0"
          >
            <span className="col-span-5 capitalize font-medium text-gray-800 dark:text-gray-200 leading-snug pr-2">
              {item.title}
            </span>
            <span className="col-span-2 text-center text-gray-500 dark:text-gray-400">
              {item.quantity}
            </span>
            <span className="col-span-2 text-right text-gray-500 dark:text-gray-400">
              {Number(item.price).toLocaleString()}
            </span>
            <span className="col-span-3 text-right font-semibold text-gray-800 dark:text-gray-200">
              {Number(item.total).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-3" />

      {/* ── Totals ── */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Subtotal</span>
          <span>{subtotal.toLocaleString()} USD</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span>- {discount.toLocaleString()} USD</span>
          </div>
        )}
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Tax</span>
          <span>{tax.toLocaleString()} USD</span>
        </div>
      </div>

      {/* ── Total row ── */}
      <div className="flex justify-between items-center font-bold text-sm text-gray-900 dark:text-white mt-3 pt-3 border-t-2 border-gray-300 dark:border-gray-600">
        <span>Total Amount</span>
        <span className="text-base text-primary-600 dark:text-primary-400">
          {total.toLocaleString()} USD
        </span>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-dashed border-gray-300 dark:border-gray-600 my-3" />

      {/* ── Payment Method ── */}
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400 dark:text-gray-500">Payment Method</span>
        <span className="font-semibold capitalize text-gray-700 dark:text-gray-300 flex items-center gap-1">
          {order.payment_method || 'Cash'}
        </span>
      </div>

      {/* ── Order Status ── */}
      <div className="flex justify-between items-center text-xs mt-1">
        <span className="text-gray-400 dark:text-gray-500">Order Status</span>
        <span className="font-semibold capitalize text-gray-700 dark:text-gray-300 flex items-center gap-1">
          {order.status || 'Pending'}
        </span>
      </div>

      {/* ── Payment Status ── */}
      <div className="flex justify-between items-center text-xs mt-1">
        <span className="text-gray-400 dark:text-gray-500">Payment Status</span>
        <span className="font-semibold capitalize text-gray-700 dark:text-gray-300 flex items-center gap-1">
          {order.payment_status || 'Unpaid'}
        </span>
      </div>

      {/* ── Footer ── */}
      <div className="text-center mt-5 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
        <p className="text-primary-500 dark:text-primary-400 font-bold text-xs uppercase tracking-widest">
          Thank You!
        </p>
        <p className="text-gray-400 dark:text-gray-600 text-xs mt-1">
          Please come again • We appreciate your business
        </p>
      </div>
    </div>
  );
};

export default Bill;