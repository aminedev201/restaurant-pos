import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './guards/GuestRoute';
import GuestRoute from './guards/ProtectedRoute';
import ToasterConfig from './config/ToasterConfig';
import { ROUTES } from './config/routes';
import NotFoundPage from './pages/NotFoundPage';

// -------------- For Guest --------------
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/Registerpage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/Auth/VerifyEmailPage";

// -------------- For User --------------
import DashboardPage from "./pages/DashboardPage";
import CategoriesPage from './pages/CategoriesPage';
import ItemsPage from './pages/ItemsPage';
import MenuPage from './pages/MenuPage';
import OrdersPage from './pages/OrdersPage';


// Guest Routes Configuration
const guestRoutes = [
  { path: ROUTES.LOGIN, element: <LoginPage /> },
  { path: ROUTES.REGISTER, element: <RegisterPage /> },
  { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
  { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage /> },
  { path: ROUTES.VERIFY_EMAIL, element: <VerifyEmailPage /> },
];

// Protected Routes Configuration
const protectedRoutes = [
  { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
  { path: ROUTES.CATEGORIES, element: <CategoriesPage /> },
  { path: ROUTES.ITEMS, element: <ItemsPage /> },
  { path: ROUTES.MENU, element: <MenuPage /> },
  { path: ROUTES.ORDERS, element: <OrdersPage /> },
];

const App = () => {
  return (
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Home Route */}
              <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />

              {/* Guest Routes (Auth) */}
              {guestRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<GuestRoute>{route.element}</GuestRoute>}
                />
              ))}

              {/* Protected Routes */}
              {protectedRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<ProtectedRoute>{route.element}</ProtectedRoute>}
                />
              ))}

              {/* 404 Not Found */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>

            {/* Global Toast Notifications */}
            <ToasterConfig />

          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>

  );
};

export default App;