import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/Themecontext';
import { AuthProvider } from './contexts/Authcontext';
import ProtectedRoute from './guards/GuestRoute';
import { ROUTES } from './config/routes';
import GuestRoute from './guards/ProtectedRoute';
import LoginPage from './pages/Auth/Loginpage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import RegisterPage from './pages/Auth/Registerpage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import VerifyEmailPage from './pages/Auth/VerifyEmailPage';
import DashboardPage from './pages/Dashboardpage';
import ToasterConfig from './config/ToasterConfig';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Guest Routes */}
            <Route
              path={ROUTES.LOGIN}
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            <Route
              path={ROUTES.REGISTER}
              element={
                <GuestRoute>
                  <RegisterPage />
                </GuestRoute>
              }
            />
            <Route
              path={ROUTES.FORGOT_PASSWORD}
              element={
                <GuestRoute>
                  <ForgotPasswordPage />
                </GuestRoute>
              }
            />
            <Route
              path={ROUTES.RESET_PASSWORD}
              element={
                <GuestRoute>
                  <ResetPasswordPage />
                </GuestRoute>
              }
            />
            <Route
              path={ROUTES.VERIFY_EMAIL}
              element={
                <GuestRoute>
                  <VerifyEmailPage />
                </GuestRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />
          
            {/* 404 Not Found */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                      404
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                      Page not found
                    </p>
                    <a
                      href={ROUTES.HOME}
                      className="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition duration-200"
                    >
                      Go Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>

          {/* Toast Notifications */}
          <ToasterConfig/>

        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;