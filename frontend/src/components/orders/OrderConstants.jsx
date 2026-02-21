import {
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

// ─── Constants ────────────────────────────────────────────────────────────────
export const ORDER_STATUSES   = ['pending', 'processing', 'completed', 'cancelled'];
export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'];
export const PAYMENT_METHODS  = ['cash', 'card', 'mobile'];

// ─── Badge style maps ─────────────────────────────────────────────────────────
export const statusStyles = {
  pending:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
export const paymentStatusStyles = {
  unpaid:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  paid:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  refunded: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};
export const paymentMethodStyles = {
  cash:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  card:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  mobile: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
};

// ─── Icon helpers ─────────────────────────────────────────────────────────────
export const StatusIcon = ({ status }) => {
  const icons = {
    pending:    <ClockIcon className="w-3 h-3" />,
    processing: <ArrowPathIcon className="w-3 h-3" />,
    completed:  <CheckCircleIcon className="w-3 h-3" />,
    cancelled:  <XCircleIcon className="w-3 h-3" />,
  };
  return icons[status] || null;
};

export const PaymentMethodIcon = ({ method }) => {
const icons = {
cash:   <BanknotesIcon className="w-3 h-3" />,
card:   <CreditCardIcon className="w-3 h-3" />,
mobile: <DevicePhoneMobileIcon className="w-3 h-3" />,
};
return icons[method] || null;
};