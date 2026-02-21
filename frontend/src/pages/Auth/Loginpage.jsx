import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  AtSymbolIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightOnRectangleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/auth';
import { ROUTES } from '../../config/routes';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { title } from '../../services/helpers';
import Logo from '../../assets/logo/rest-pos-logo.svg';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = title('Login');
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(formData);

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        navigate(ROUTES.DASHBOARD);
      }
    } catch (error) {
      const apiError = error.response?.data;

      if (apiError?.email_verified === false) {
        toast.error('Please verify your email address first.');
        navigate(ROUTES.VERIFY_EMAIL, {
          state: { email: formData.email }
        });
        return;
      }

      if (apiError?.errors) {
        const formattedErrors = {};
        Object.entries(apiError.errors).forEach(([key, messages]) => {
          formattedErrors[key] = messages[0];
        });
        setErrors(formattedErrors);
      } else if (apiError?.message) {
        toast.error(apiError.message);
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-2xl mb-4 shadow-lg">
            <img src={Logo} alt="Rest POS Logo" />
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-600 dark:from-primary-400 dark:to-primary-400 bg-clip-text text-transparent mb-2">
            Restaurant POS
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Sign in to manage your restaurant</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="you@restaurant.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl  focus:border-primary-500 focus:outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'
                    }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl  focus:border-primary-500 focus:outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed ${errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={formData.remember}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 border-gray-300 dark:border-gray-600 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 accent-primary-600"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                  Remember me
                </label>
              </div>

              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <LockClosedIcon className="w-4 h-4" />
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 dark:from-primary-500 dark:to-primary-500 dark:hover:from-primary-600 dark:hover:to-primary-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>

            {/* Sign up link */}
            <div className="text-center text-sm pt-2">
              <span className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
              </span>
              <Link
                to={ROUTES.REGISTER}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
              >
                Create Account
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          By signing in, you agree to our{' '}
          <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;