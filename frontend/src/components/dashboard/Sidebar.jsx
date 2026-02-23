import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  HomeIcon,
  CubeIcon,
  Squares2X2Icon,
  ShoppingCartIcon,
  XMarkIcon,
  QueueListIcon,
} from '@heroicons/react/24/outline';
import { ROUTES } from '../../config/routes';
import { getAppName } from '../../services/helpers';
import Logo from '../../assets/logo/rest-pos-logo.svg';
import { useNavCounts } from '../../contexts/NavCountsContext';

// ─── Badge Pill ───────────────────────────────────────────────────────────────

const NavBadge = ({ count, variant = 'default' }) => {
  if (!count) return null;
  const display = count > 99 ? '99+' : String(count);
  const cls =
    variant === 'alert'
      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
      : 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400';
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${cls}`}>
      {display}
    </span>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = ({ isOpen, isMobileOpen, onClose }) => {
  const location            = useLocation();
  const { counts }          = useNavCounts(); // ← just reads, never fetches

  const menuItems = [
    {
      title: 'Dashboard',
      path:  ROUTES.DASHBOARD,
      icon:  HomeIcon,
    },
    {
      title: 'Menu',
      path:  '/menu',
      icon:  QueueListIcon,
    },
    {
      title: 'Orders',
      path:  '/orders',
      icon:  ShoppingCartIcon,
      badge: counts.orders,
      alert: counts.pending, // red — pending orders needing attention
    },
    {
      title: 'Items',
      path:  '/Items',
      icon:  CubeIcon,
      badge: counts.items,
    },
    {
      title: 'Categories',
      path:  '/categories',
      icon:  Squares2X2Icon,
      badge: counts.categories,
    },
    {
      title: 'Report',
      path:  '/report',
      icon:  Squares2X2Icon,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isOpen ? 'lg:w-64' : 'lg:w-20'}
          lg:translate-x-0
        `}
        style={{ width: isMobileOpen ? '16rem' : undefined }}
      >
        <div className="flex flex-col h-full">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className={`flex items-center ${isOpen ? 'justify-between p-6' : 'justify-center p-4 lg:p-6'} border-b border-gray-200 dark:border-gray-700 h-16`}>
            <div className={`flex items-center space-x-3 ${!isOpen && 'lg:space-x-0'}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <img src={Logo} alt="Rest POS Logo" />
              </div>
              {(isOpen || isMobileOpen) && (
                <span className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
                  {getAppName()}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* ── Navigation ─────────────────────────────────────────────────── */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
            <div className={`${isOpen ? 'px-3' : 'px-2 lg:px-3'} space-y-1`}>
              {menuItems.map((item) => {
                const active   = isActive(item.path);
                const hasBadge = item.badge > 0;
                const hasAlert = item.alert > 0;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`
                      group relative flex items-center
                      ${isOpen ? 'space-x-3 px-3' : 'justify-center lg:px-3'}
                      py-3 rounded-lg transition-all duration-200
                      ${active
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {/* Icon + collapsed dot */}
                    <div className="relative flex-shrink-0">
                      <item.icon className="w-5 h-5" />
                      {!isOpen && !isMobileOpen && (hasAlert || hasBadge) && (
                        <span className={`
                          absolute -top-1 -right-1 w-2 h-2 rounded-full
                          border-2 border-white dark:border-gray-800
                          ${hasAlert ? 'bg-red-500' : 'bg-primary-500'}
                        `} />
                      )}
                    </div>

                    {/* Expanded label + badges */}
                    {(isOpen || isMobileOpen) && (
                      <>
                        <span className="font-medium flex-1 min-w-0 truncate">{item.title}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {hasAlert && <NavBadge count={item.alert} variant="alert" />}
                          {hasBadge && <NavBadge count={item.badge} variant="default" />}
                        </div>
                        {active && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400 flex-shrink-0 ml-1" />
                        )}
                      </>
                    )}

                    {/* Tooltip when collapsed */}
                    {!isOpen && !isMobileOpen && (
                      <div className="
                        absolute left-full ml-2 px-3 py-2
                        bg-gray-900 text-white text-sm rounded-lg
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible
                        transition-all duration-200 whitespace-nowrap z-50
                        flex items-center gap-2 pointer-events-none
                      ">
                        {item.title}
                        {hasAlert && (
                          <span className="px-1.5 py-0.5 text-xs bg-red-500 rounded-full font-semibold">
                            {item.alert > 99 ? '99+' : item.alert} pending
                          </span>
                        )}
                        {hasBadge && !hasAlert && (
                          <span className="px-1.5 py-0.5 text-xs bg-primary-500 rounded-full font-semibold">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

        </div>
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  isOpen:       PropTypes.bool.isRequired,
  isMobileOpen: PropTypes.bool.isRequired,
  onClose:      PropTypes.func.isRequired,
};

export default Sidebar;