import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Bars3Icon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';

// ─── User Avatar (shared helper) ─────────────────────────────────────────────

const NavAvatar = ({ user, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-11 h-11 text-base';

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user?.name}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white dark:ring-gray-800`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold ring-2 ring-white dark:ring-gray-800`}
    >
      {user?.name?.charAt(0).toUpperCase() ?? '?'}
    </div>
  );
};

// ─── Navbar ───────────────────────────────────────────────────────────────────

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch {
      console.error('Logout failed');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ── Left: Sidebar toggle ── */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200 text-gray-700 dark:text-gray-300"
              aria-label="Toggle sidebar"
              title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isSidebarOpen ? (
                <ChevronDoubleLeftIcon className="w-6 h-6 hidden lg:block" />
              ) : (
                <ChevronDoubleRightIcon className="w-6 h-6 hidden lg:block" />
              )}
              <Bars3Icon className="w-6 h-6 lg:hidden" />
            </button>
          </div>

          {/* ── Right: Actions ── */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Desktop Search */}
            {/* <button
              className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 text-gray-600 dark:text-gray-300"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              <span className="text-sm">Search...</span>
              <kbd className="hidden xl:inline-block px-2 py-0.5 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                ⌘K
              </kbd>
            </button> */}

            {/* Mobile Search */}
            {/* <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200 text-gray-700 dark:text-gray-300"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button> */}

            {/* Notifications */}
            {/* <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200 relative text-gray-700 dark:text-gray-300">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button> */}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* ── User Dropdown ── */}
            <div
              ref={dropdownRef}
              className="relative flex items-center space-x-3 pl-2 sm:pl-3 border-l border-gray-200 dark:border-gray-700"
            >
              {/* Name / email (lg+) */}
              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>

              {/* Trigger button */}
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center space-x-2 hover:opacity-80 transition duration-200 focus:outline-none"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <NavAvatar user={user} />
                <ChevronDownIcon
                  className={`hidden sm:block w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <NavAvatar user={user} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate capitalize">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      to={ROUTES.PROFILE ?? '/profile'}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <UserCircleIcon className="w-4 h-4 text-gray-400" />
                      My Profile
                    </Link>

                    {/* <Link
                      to={ROUTES.SETTINGS ?? '/settings'}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Cog6ToothIcon className="w-4 h-4 text-gray-400" />
                      Settings
                    </Link> */}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-1 pb-0.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

Navbar.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
};

export default Navbar;