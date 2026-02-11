import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authService from '../../services/auth';
import { ROUTES } from '../../config/routes';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Loading from '../../components/common/Loading';
import { title } from '../../services/helpers';
import {
  CheckCircleIcon,
  EnvelopeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);

  useEffect(() => {
    document.title = title('Verify Email');
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      if (!email) {
        setIsCheckingStatus(false);
        navigate(ROUTES.LOGIN);
        return;
      }

      try {
        const response = await authService.checkVerificationStatus(email);
        if (response.success && response.data.email_verified) {
          setIsAlreadyVerified(true);
          toast.success('Your email is already verified! Redirecting to login...');
          setTimeout(() => navigate(ROUTES.LOGIN), 2000);
        }
      } catch (error) {
        console.error('Failed to check verification status:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [email, navigate]);

  const handleResendEmail = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Email address not found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resendVerificationEmail(email);
      if (response.success) {
        toast.success('Verification email sent! Check your inbox.');
      }
    } catch (error) {
      const apiError = error.response?.data;
      if (apiError?.message?.toLowerCase().includes('already verified')) {
        setIsAlreadyVerified(true);
        toast.success('Your email is already verified! Redirecting to login...');
        setTimeout(() => navigate(ROUTES.LOGIN), 2000);
        return;
      }
      toast.error(apiError?.message || 'Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStatus) {
    return <Loading />;
  }

  if (isAlreadyVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Email Already Verified</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Your email has already been verified</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Your email address has already been verified. You can now sign in to your account.
              </p>
            </div>

            {email && (
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Verified email:</p>
                <p className="font-semibold text-gray-900 dark:text-white">{email}</p>
              </div>
            )}

            <Link
              to={ROUTES.LOGIN}
              className="inline-block w-full bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 dark:from-primary-500 dark:to-primary-500 dark:hover:from-primary-600 dark:hover:to-primary-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/30"
            >
              Go to Login
            </Link>
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
            <EnvelopeIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-600 dark:from-primary-400 dark:to-primary-400 bg-clip-text text-transparent mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">We've sent you a verification link</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <div className="text-center space-y-5">
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">We've sent a verification link to</p>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">{email}</p>
            </div>

            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Click the verification link in your email to activate your account and start using our services.
              </p>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              If you don't see the email, check your spam folder.
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleResendEmail}
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 dark:from-primary-500 dark:to-primary-500 dark:hover:from-primary-600 dark:hover:to-primary-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <ArrowPathIcon className="w-5 h-5" />
                    Resend Verification Email
                  </>
                )}
              </button>

              <div className="text-center text-sm space-x-2">
                <span className="text-gray-600 dark:text-gray-400">Wrong email?</span>
                <Link
                  to={ROUTES.REGISTER}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  Create new account
                </Link>
              </div>

              <div className="text-center text-sm">
                <Link
                  to={ROUTES.LOGIN}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;