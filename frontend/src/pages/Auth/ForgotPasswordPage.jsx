import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  AtSymbolIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import authService from '../../services/auth';
import { ROUTES } from '../../config/routes';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { title } from '../../services/helpers';

const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({ email: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    document.title = title('Forgot Password');
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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
      const response = await authService.forgotPassword(formData);

      if (response.success) {
        setEmailSent(true);
        toast.success('Password reset link sent! Check your email.');
      }
    } catch (error) {
      const apiError = error.response?.data;

      if (apiError?.errors) {
        const formattedErrors = {};
        Object.entries(apiError.errors).forEach(([key, messages]) => {
          formattedErrors[key] = messages[0];
        });
        setErrors(formattedErrors);
      } else if (apiError?.message) {
        toast.error(apiError.message);
      } else {
        toast.error('Failed to send reset link. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
              <EnvelopeIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-600 dark:from-primary-400 dark:to-primary-400 bg-clip-text text-transparent mb-2">Check Your Email</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">We've sent you a password reset link</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                We've sent a password reset link to
              </p>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">
                {formData.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click the link in the email to reset your password. If you don't see the email, check your spam folder.
              </p>

              <div className="space-y-3 pt-4">
                <Link
                  to="#"
                  onClick={() => setEmailSent(false)}
                  className="block w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-xl transition-colors text-center"
                >
                  Try Different Email
                </Link>

                <div className="text-center text-sm">
                  <Link to={ROUTES.LOGIN} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl mb-4">
            <LockClosedIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-600 dark:from-primary-400 dark:to-primary-400 bg-clip-text text-transparent mb-2">Forgot Password?</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Enter your email to reset your password</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl  focus:border-primary-500 focus:outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
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

            <Link
              to="#"
              onClick={handleSubmit}
              className={`w-full bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 dark:from-primary-500 dark:to-primary-500 dark:hover:from-primary-600 dark:hover:to-primary-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 ${isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                }`}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Send Reset Link'}
            </Link>

            <div className="text-center text-sm pt-2">
              <Link to={ROUTES.LOGIN} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;