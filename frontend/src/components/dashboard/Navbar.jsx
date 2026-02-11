import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';
import { 
  Bars3Icon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
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
          {/* Left side - Menu toggle and breadcrumb */}
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle Button */}
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

          {/* Right side - Search, Notifications, Theme, User */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Search Button */}
            <button
              className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 text-gray-600 dark:text-gray-300"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              <span className="text-sm">Search...</span>
              <kbd className="hidden xl:inline-block px-2 py-0.5 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200 text-gray-700 dark:text-gray-300"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200 relative text-gray-700 dark:text-gray-300">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu Dropdown */}
            <div className="flex items-center space-x-3 pl-2 sm:pl-3 border-l border-gray-200 dark:border-gray-700">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>

              <button className="flex items-center space-x-2 hover:opacity-80 transition duration-200">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-white dark:ring-gray-800">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <ChevronDownIcon className="hidden sm:block w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={handleLogout}
                className="hidden xl:flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition duration-200 font-medium text-sm"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>

              <button
                onClick={handleLogout}
                className="xl:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200 text-gray-700 dark:text-gray-300"
                aria-label="Logout"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
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