import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { 
  HomeIcon,
  FolderIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { ROUTES } from '../../config/routes';
import { getAppName } from '../../services/helpers';
import Logo from '../../assets/logo/rest-pos-logo.svg';

const Sidebar = ({ isOpen, isMobileOpen, onClose }) => {
  const location = useLocation();
  
  const menuItems = [
    {
      title: 'Dashboard',
      path: ROUTES.DASHBOARD,
      icon: HomeIcon,
    },
    {
      title: 'Categories',
      path: '/categories',
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4h6v6H4V4zm0 10h6v6H4v-6zm10-10h6v6h-6V4zm0 10h6v6h-6v-6z"
          />
        </svg>
      ),
      badge: '12',
    },
    {
      title: 'Projects',
      path: '/projects',
      icon: FolderIcon,
    },
    {
      title: 'Team',
      path: '/team',
      icon: UserGroupIcon,
    },
    {
      title: 'Messages',
      path: '/messages',
      icon: ChatBubbleLeftRightIcon,
      badge: '5',
    },
    {
      title: 'Calendar',
      path: '/calendar',
      icon: CalendarIcon,
    },
  ];

  const secondaryMenuItems = [
    {
      title: 'Settings',
      path: '/settings',
      icon: CogIcon,
    },
    {
      title: 'Help & Support',
      path: '/support',
      icon: QuestionMarkCircleIcon,
    },
  ];

  const isActive = (path) => location.pathname === path;

  const renderIcon = (IconComponent) => {
    if (typeof IconComponent === 'function' && IconComponent.prototype === undefined) {
      return <IconComponent />;
    }
    return <IconComponent className="w-5 h-5 flex-shrink-0" />;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
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
          {/* Sidebar Header */}
          <div className={`flex items-center ${isOpen ? 'justify-between p-6' : 'justify-center p-4 lg:p-6'} border-b border-gray-200 dark:border-gray-700 h-16`}>
            <div className={`flex items-center space-x-3 ${!isOpen && 'lg:space-x-0'}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <img src={Logo} alt="Rest POS Logo"/>
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

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
            {/* Main Menu */}
            <div className={`${isOpen ? 'px-3' : 'px-2 lg:px-3'} space-y-1`}>
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    group relative flex items-center ${isOpen ? 'space-x-3 px-3' : 'justify-center lg:px-3'} py-3 rounded-lg
                    transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                  title={!isOpen ? item.title : undefined}
                >
                  {renderIcon(item.icon)}
                  
                  {(isOpen || isMobileOpen) && (
                    <>
                      <span className="font-medium flex-1">{item.title}</span>
                      
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full">
                          {item.badge}
                        </span>
                      )}

                      {isActive(item.path) && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400"></div>
                      )}
                    </>
                  )}

                  {/* Tooltip for collapsed state */}
                  {!isOpen && !isMobileOpen && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {item.title}
                      {item.badge && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-500 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className={`my-4 ${isOpen ? 'mx-3' : 'mx-2 lg:mx-3'} border-t border-gray-200 dark:border-gray-700`}></div>

            {/* Secondary Menu */}
            <div className={`${isOpen ? 'px-3' : 'px-2 lg:px-3'} space-y-1`}>
              {secondaryMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    group relative flex items-center ${isOpen ? 'space-x-3 px-3' : 'justify-center lg:px-3'} py-3 rounded-lg
                    transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                  title={!isOpen ? item.title : undefined}
                >
                  {renderIcon(item.icon)}
                  
                  {(isOpen || isMobileOpen) && (
                    <span className="font-medium">{item.title}</span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {!isOpen && !isMobileOpen && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {item.title}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* Sidebar Footer - Only show when expanded */}
          {(isOpen || isMobileOpen) && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-900/10 rounded-xl p-4 border border-primary-200 dark:border-primary-800">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BoltIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-gray-900 dark:text-white">
                      Upgrade to Pro
                    </span>
                    <span className="block text-xs text-gray-600 dark:text-gray-400">
                      Unlock all features
                    </span>
                  </div>
                </div>
                <button className="w-full px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isMobileOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;