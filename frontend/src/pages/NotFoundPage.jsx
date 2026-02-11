import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { useEffect } from 'react';
import { title } from '../services/helpers';

const NotFoundPage = () => {
  
  useEffect(() => {
    document.title = title('Not Found');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Page not found
        </p>
        <Link
          to={ROUTES.HOME}
          className="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition duration-200"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;