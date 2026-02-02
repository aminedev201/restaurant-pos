import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authService from '../../services/auth';
import { ROUTES } from '../../config/routes';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Loading from '../../components/common/Loading';

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);

  // Check verification status on component mount
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
          setTimeout(() => {
            navigate(ROUTES.LOGIN);
          }, 2000);
        }
      } catch (error) {
        console.error('Failed to check verification status:', error);
        // Continue normally if check fails
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
      
      // Handle case where email is already verified
      if (apiError?.message?.toLowerCase().includes('already verified')) {
        setIsAlreadyVerified(true);
        toast.success('Your email is already verified! Redirecting to login...');
        setTimeout(() => {
          navigate(ROUTES.LOGIN);
        }, 2000);
        return;
      }
      
      toast.error(apiError?.message || 'Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking verification status
  if (isCheckingStatus) {
    return <Loading />;
  }

  // Show already verified state
  if (isAlreadyVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-4">
              <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verified email:
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {email}
                </p>
              </div>
            )}

            <Link 
              to={ROUTES.LOGIN} 
              className="inline-block w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 dark:from-orange-500 dark:to-amber-500 dark:hover:from-orange-600 dark:hover:to-amber-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/30"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Normal verification pending state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl mb-4">
            <svg className="w-10 h-10 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent mb-2">Verify Your Email</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">We've sent you a verification link</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
          <div className="text-center space-y-5">
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                We've sent a verification link to
              </p>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">
                {email}
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
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
                className={`w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 dark:from-orange-500 dark:to-amber-500 dark:hover:from-orange-600 dark:hover:to-amber-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Resend Verification Email
                  </>
                )}
              </button>

              <div className="text-center text-sm space-x-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Wrong email?
                </span>
                <Link to={ROUTES.REGISTER} className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium">
                  Create new account
                </Link>
              </div>

              <div className="text-center text-sm">
                <Link to={ROUTES.LOGIN} className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium">
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