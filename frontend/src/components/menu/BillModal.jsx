import { useRef } from 'react';
import { XMarkIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Bill from './Bill';

// ─── BillModal — Order summary modal with print ───────────────────────────────
// Props:
//   isOpen  : bool
//   onClose : () => void
//   order   : { order_number, payment_method, discount, tax, created_at }
//   items   : [{ title, quantity, price, total }]

const BillModal = ({ isOpen, onClose, order, items = [] }) => {
  const printRef = useRef(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    const subtotal = Number(order.subtotal || 0);
    const tax      = Number(order.tax      || 0);
    const discount = Number(order.discount || 0);
    const total    = Number(order.total    || 0);

    const date = order.created_at
        ? new Date(order.created_at).toLocaleString()
        : new Date().toLocaleString();

    const itemRows = items.map((item) => `
      <tr>
        <td class="item-name">${item.title}</td>
        <td class="center">${item.quantity}</td>
        <td class="right">${Number(item.price).toLocaleString()}</td>
        <td class="right bold">${Number(item.total).toLocaleString()}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Bill #${order.order_number}</title>
  <style>
    /* ── Reset ── */
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    /* ── Page ── */
    @page {
      size: 80mm auto;          /* thermal receipt width */
      margin: 0;
    }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      color: #111827;
      background: #fff;
      width: 80mm;
      max-width: 80mm;
      margin: 0 auto;
      padding: 12px 14px 20px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Utilities ── */
    .center  { text-align: center; }
    .right   { text-align: right; }
    .left    { text-align: left; }
    .bold    { font-weight: 700; }
    .small   { font-size: 9.5px; }
    .muted   { color: #6b7280; }
    .primary { color: #CD5700; }
    .upper   { text-transform: uppercase; letter-spacing: 0.08em; }

    /* ── Dividers ── */
    .divider-solid  { border-top: 1px solid #d1d5db; margin: 8px 0; }
    .divider-dashed { border-top: 1px dashed #d1d5db; margin: 8px 0; }
    .divider-double {
      border-top: 3px double #CD5700;
      margin: 10px 0;
    }

    /* ── Header ── */
    .header { text-align: center; padding-bottom: 4px; }
    .header .logo-icon {
      font-size: 22px;
      line-height: 1;
      margin-bottom: 4px;
    }
    .header .shop-name {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #CD5700;
    }
    .header .shop-sub {
      font-size: 9px;
      color: #9ca3af;
      letter-spacing: 0.06em;
      margin-top: 1px;
    }
    .header .bill-label {
      font-size: 9px;
      font-weight: 700;
      color: #CD5700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      margin-top: 8px;
    }
    .header .bill-number {
      font-size: 17px;
      font-weight: 700;
      color: #111827;
      margin-top: 1px;
    }
    .header .bill-date {
      font-size: 9px;
      color: #9ca3af;
      margin-top: 2px;
    }

    /* ── Items Table ── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
    }
    thead tr th {
      font-size: 9px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      padding: 5px 2px 4px;
      border-bottom: 1px solid #e5e7eb;
    }
    tbody tr td {
      padding: 5px 2px;
      border-bottom: 1px dashed #f3f4f6;
      vertical-align: top;
      font-size: 10.5px;
    }
    tbody tr:last-child td { border-bottom: none; }
    td.item-name {
      width: 44%;
      text-transform: capitalize;
      line-height: 1.35;
      padding-right: 4px;
    }
    td.center { text-align: center; width: 12%; }
    td.right  { text-align: right; }

    /* ── Totals ── */
    .totals { width: 100%; margin-top: 4px; }
    .totals td { padding: 2.5px 2px; font-size: 10.5px; }
    .totals .label { color: #6b7280; }
    .totals .value { text-align: right; }
    .totals .grand-label {
      font-size: 12px;
      font-weight: 700;
      color: #111827;
      padding-top: 6px;
    }
    .totals .grand-value {
      font-size: 13px;
      font-weight: 700;
      color: #CD5700;
      text-align: right;
      padding-top: 6px;
    }
    .totals .discount { color: #16a34a; }

    /* ── Payment ── */
    .payment-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #6b7280;
      margin-top: 2px;
    }
    .payment-row .method {
      font-weight: 700;
      text-transform: capitalize;
      color: #374151;
    }

    /* ── Footer ── */
    .footer {
      text-align: center;
      margin-top: 10px;
      padding-top: 4px;
    }
    .footer .thank-you {
      font-size: 11px;
      font-weight: 700;
      color: #CD5700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .footer .tagline {
      font-size: 9px;
      color: #9ca3af;
      margin-top: 2px;
    }
    .footer .barcode {
      margin: 8px auto 0;
      font-family: 'Libre Barcode 39', monospace;
      font-size: 28px;
      letter-spacing: 2px;
      color: #374151;
      line-height: 1;
    }
    .footer .barcode-text {
      font-size: 8px;
      color: #9ca3af;
      margin-top: 2px;
      letter-spacing: 0.1em;
    }

    /* ── Print-only: hide browser chrome ── */
    @media print {
      body { padding: 8px 10px 16px; }
      html { background: #fff; }
    }
  </style>
</head>
<body>

  <!-- ── Header ── -->
  <div class="header">
    <div class="logo-icon">🧾</div>
    <div class="shop-name">Resta POS</div>
    <div class="shop-sub">POINT OF SALE RECEIPT</div>
    <div class="bill-label">✦ Bill Success Created ✦</div>
    <div class="bill-number">#${order.order_number}</div>
    <div class="bill-date">${date}</div>
  </div>

  <div class="divider-double"></div>

  <!-- ── Items ── -->
  <table>
    <thead>
      <tr>
        <th class="left">Item</th>
        <th class="center">Qty</th>
        <th class="right">Price</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="divider-dashed"></div>

  <!-- ── Totals ── -->
  <table class="totals">
    <tbody>
      <tr>
        <td class="label">Subtotal</td>
        <td class="value">${subtotal.toLocaleString()} USD</td>
      </tr>
      ${discount > 0 ? `
      <tr>
        <td class="label discount">Discount</td>
        <td class="value discount">- ${discount.toLocaleString()} USD</td>
      </tr>` : ''}
      <tr>
        <td class="label">Tax</td>
        <td class="value">${tax.toLocaleString()} USD</td>
      </tr>
    </tbody>
  </table>

  <div class="divider-solid"></div>

  <table class="totals">
    <tbody>
      <tr>
        <td class="grand-label">TOTAL AMOUNT</td>
        <td class="grand-value">${total.toLocaleString()} USD</td>
      </tr>
    </tbody>
  </table>

  <div class="divider-dashed"></div>

  <!-- ── Payment Method ── -->
  <div class="payment-row">
    <span>Payment Method</span>
    <span class="method">${order.payment_method || 'Cash'}</span>
  </div>
  <!-- ── Order Status ── -->
  <div class="payment-row">
  <span>Order Status</span>
  <span class="method">${order.status || 'Pending'}</span>
  </div>
  <!-- ── Payment Status ── -->
  <div class="payment-row">
    <span>Payment Status</span>
    <span class="method">${order.payment_status || 'Unpaid'}</span>
  </div>

  <div class="divider-dashed"></div>

  <!-- ── Footer ── -->
  <div class="footer">
    <div class="thank-you">Thank You!</div>
    <div class="tagline">Please come again • We appreciate your business</div>
    <div class="barcode">${order.order_number}</div>
    <div class="barcode-text">ORDER REF: ${order.order_number}</div>
  </div>

</body>
</html>`;

    const win = window.open('', '_blank', 'width=380,height=700,scrollbars=yes');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col"
          style={{ animation: 'modalIn 0.2s ease-out' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="px-6 pt-8 pb-5 text-center flex-shrink-0">
            {/* Success icon */}
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-9 h-9 text-primary-500" />
            </div>
            <p className="text-xs font-semibold text-primary-500 uppercase tracking-widest mb-1">
              Bill Success Created
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bill: #{order.order_number}
            </h2>
            {order.created_at && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {new Date(order.created_at).toLocaleString()}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="mx-6 border-t border-dashed border-gray-200 dark:border-gray-700" />

          {/* Bill content — scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 bg-gray-50 dark:bg-gray-900/40" ref={printRef}>
            {/* Receipt card */}
            <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm px-4 py-4">
              <Bill order={order} items={items} />
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 border-t border-gray-100 dark:border-gray-700" />

          {/* Footer actions */}
          <div className="px-6 py-4 flex gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <XMarkIcon className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-200 dark:shadow-primary-900/30"
            >
              <PrinterIcon className="w-4 h-4" />
              Print Bill
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </>
  );
};

export default BillModal;