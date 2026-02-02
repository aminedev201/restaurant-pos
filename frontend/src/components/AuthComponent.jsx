// import React, { useState, useEffect } from 'react';
// import { User, Mail, Lock, LogIn, UserPlus, LogOut, Eye, EyeOff, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

// // Toast Notification Component
// const Toast = ({ message, type, onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       onClose();
//     }, 5000);

//     return () => clearTimeout(timer);
//   }, [onClose]);

//   const icons = {
//     success: <CheckCircle className="w-5 h-5" />,
//     error: <AlertCircle className="w-5 h-5" />,
//     info: <AlertCircle className="w-5 h-5" />,
//   };

//   const colors = {
//     success: 'bg-green-500',
//     error: 'bg-red-500',
//     info: 'bg-blue-500',
//   };

//   return (
//     <div className={`fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slideIn z-50`}>
//       {icons[type]}
//       <p className="flex-1 font-medium">{message}</p>
//       <button onClick={onClose} className="hover:bg-white/20 rounded p-1 transition">
//         <X className="w-4 h-4" />
//       </button>
//     </div>
//   );
// };

// // Toast Container Component
// const ToastContainer = ({ toasts, removeToast }) => {
//   return (
//     <div className="fixed top-4 right-4 z-50 space-y-2">
//       {toasts.map((toast) => (
//         <Toast
//           key={toast.id}
//           message={toast.message}
//           type={toast.type}
//           onClose={() => removeToast(toast.id)}
//         />
//       ))}
//     </div>
//   );
// };

// // API Service
// const API_URL = 'http://localhost:8000/api';

// const authService = {
//   async register(name, email, password, passwordConfirmation) {
//     const response = await fetch(`${API_URL}/register`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//       },
//       body: JSON.stringify({
//         name,
//         email,
//         password,
//         password_confirmation: passwordConfirmation,
//       }),
//     });
//     return await response.json();
//   },

//   async login(email, password, remember = false) {
//     const response = await fetch(`${API_URL}/login`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//       },
//       body: JSON.stringify({ email, password, remember }),
//     });
//     return await response.json();
//   },

//   async logout(token) {
//     const response = await fetch(`${API_URL}/logout`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//     });
//     return await response.json();
//   },

//   async getUser(token) {
//     const response = await fetch(`${API_URL}/user`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//     });
//     return await response.json();
//   },

//   async resendVerification(email) {
//     const response = await fetch(`${API_URL}/email/resend`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//       },
//       body: JSON.stringify({ email }),
//     });
//     return await response.json();
//   },
// };

// // Main Auth Component
// export default function AuthComponent() {
//   const [currentView, setCurrentView] = useState('login');
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [user, setUser] = useState(null);
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [toasts, setToasts] = useState([]);
//   const [showEmailVerificationAlert, setShowEmailVerificationAlert] = useState(false);
//   const [unverifiedUserEmail, setUnverifiedUserEmail] = useState('');

//   const [loginForm, setLoginForm] = useState({
//     email: '',
//     password: '',
//     remember: false,
//   });

//   const [registerForm, setRegisterForm] = useState({
//     name: '',
//     email: '',
//     password: '',
//     passwordConfirmation: '',
//   });

//   const [loginErrors, setLoginErrors] = useState({});
//   const [registerErrors, setRegisterErrors] = useState({});

//   // Check if user is already logged in
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const storedUser = localStorage.getItem('user');
//     if (token && storedUser) {
//       setIsLoggedIn(true);
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   // Toast functions
//   const addToast = (message, type = 'info') => {
//     const id = Date.now();
//     setToasts((prev) => [...prev, { id, message, type }]);
//   };

//   const removeToast = (id) => {
//     setToasts((prev) => prev.filter((toast) => toast.id !== id));
//   };

//   // Validation functions
//   const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const validateLoginForm = () => {
//     const errors = {};

//     if (!loginForm.email) {
//       errors.email = 'Email is required';
//     } else if (!validateEmail(loginForm.email)) {
//       errors.email = 'Please enter a valid email address';
//     }

//     if (!loginForm.password) {
//       errors.password = 'Password is required';
//     } else if (loginForm.password.length < 6) {
//       errors.password = 'Password must be at least 6 characters';
//     }

//     setLoginErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const validateRegisterForm = () => {
//     const errors = {};

//     if (!registerForm.name) {
//       errors.name = 'Name is required';
//     } else if (registerForm.name.length < 2) {
//       errors.name = 'Name must be at least 2 characters';
//     }

//     if (!registerForm.email) {
//       errors.email = 'Email is required';
//     } else if (!validateEmail(registerForm.email)) {
//       errors.email = 'Please enter a valid email address';
//     }

//     if (!registerForm.password) {
//       errors.password = 'Password is required';
//     } else if (registerForm.password.length < 8) {
//       errors.password = 'Password must be at least 8 characters';
//     }

//     if (!registerForm.passwordConfirmation) {
//       errors.passwordConfirmation = 'Please confirm your password';
//     } else if (registerForm.password !== registerForm.passwordConfirmation) {
//       errors.passwordConfirmation = 'Passwords do not match';
//     }

//     setRegisterErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   // Handle Login
//   const handleLogin = async (e) => {
//     e.preventDefault();
    
//     if (!validateLoginForm()) {
//       addToast('Please fix the form errors', 'error');
//       return;
//     }

//     setLoading(true);
//     setShowEmailVerificationAlert(false);

//     try {
//       const response = await authService.login(
//         loginForm.email,
//         loginForm.password,
//         loginForm.remember
//       );

//       if (response.success) {
//         localStorage.setItem('token', response.data.access_token);
//         localStorage.setItem('user', JSON.stringify(response.data.user));
//         localStorage.setItem('expires_at', response.data.expires_at);
        
//         setIsLoggedIn(true);
//         setUser(response.data.user);
//         setLoginForm({ email: '', password: '', remember: false });
//         setLoginErrors({});
        
//         addToast(response.message || 'Login successful!', 'success');
//       } else {
//         // Check if email is not verified (403 status)
//         if (response.email_verified === false) {
//           setShowEmailVerificationAlert(true);
//           setUnverifiedUserEmail(loginForm.email);
//           addToast(response.message || 'Please verify your email address', 'error');
//         } else {
//           if (response.errors) {
//             setLoginErrors(response.errors);
//           }
//           addToast(response.message || 'Login failed', 'error');
//         }
//       }
//     } catch (error) {
//       addToast('An error occurred during login', 'error');
//       console.error('Login error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle Resend Verification Email
//   const handleResendVerification = async () => {
//     setLoading(true);

//     try {
//       const response = await authService.resendVerification(unverifiedUserEmail);

//       if (response.success) {
//         addToast('Verification email sent! Please check your inbox.', 'success');
//       } else {
//         addToast(response.message || 'Failed to send verification email', 'error');
//       }
//     } catch (error) {
//       addToast('An error occurred while sending verification email', 'error');
//       console.error('Resend verification error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle Register
//   const handleRegister = async (e) => {
//     e.preventDefault();

//     if (!validateRegisterForm()) {
//       addToast('Please fix the form errors', 'error');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await authService.register(
//         registerForm.name,
//         registerForm.email,
//         registerForm.password,
//         registerForm.passwordConfirmation
//       );

//       if (response.success) {
//         setRegisterForm({ name: '', email: '', password: '', passwordConfirmation: '' });
//         setRegisterErrors({});
        
//         addToast(response.message || 'Registration successful! Please check your email to verify your account.', 'success');
        
//         // Switch to login view and show verification alert
//         setCurrentView('login');
//         setShowEmailVerificationAlert(true);
//         setUnverifiedUserEmail(response.data.user.email);
//       } else {
//         if (response.errors) {
//           setRegisterErrors(response.errors);
//           const errorMessages = Object.values(response.errors).flat();
//           addToast(errorMessages[0] || 'Registration failed', 'error');
//         } else {
//           addToast(response.message || 'Registration failed', 'error');
//         }
//       }
//     } catch (error) {
//       addToast('An error occurred during registration', 'error');
//       console.error('Registration error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle Logout
//   const handleLogout = async () => {
//     setLoading(true);
    
//     try {
//       const token = localStorage.getItem('token');
//       await authService.logout(token);
      
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       localStorage.removeItem('expires_at');
      
//       setIsLoggedIn(false);
//       setUser(null);
//       setCurrentView('login');
      
//       addToast('Logged out successfully', 'success');
//     } catch (error) {
//       addToast('Logout failed', 'error');
//       console.error('Logout error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Dashboard View (Logged In)
//   if (isLoggedIn && user) {
//     return (
//       <>
//         <ToastContainer toasts={toasts} removeToast={removeToast} />
//         <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
//             <div className="text-center mb-6">
//               <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
//                 <User className="w-10 h-10 text-white" />
//               </div>
//               <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
//               <p className="text-gray-600 mt-2">You are logged in</p>
//             </div>

//             <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border border-indigo-100">
//               <div className="space-y-4">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Name</p>
//                   <p className="text-lg font-semibold text-gray-800">{user.name}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
//                   <p className="text-lg font-semibold text-gray-800">{user.email}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Email Status</p>
//                   <p className="text-lg font-semibold">
//                     {user.email_verified_at ? (
//                       <span className="text-green-600 flex items-center gap-1">
//                         <CheckCircle className="w-5 h-5" />
//                         Verified
//                       </span>
//                     ) : (
//                       <span className="text-orange-600 flex items-center gap-1">
//                         <AlertCircle className="w-5 h-5" />
//                         Not Verified
//                       </span>
//                     )}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Member Since</p>
//                   <p className="text-lg font-semibold text-gray-800">
//                     {new Date(user.created_at).toLocaleDateString('en-US', {
//                       year: 'numeric',
//                       month: 'long',
//                       day: 'numeric'
//                     })}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <button
//               onClick={handleLogout}
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <LogOut className="w-5 h-5" />
//               {loading ? 'Logging out...' : 'Logout'}
//             </button>
//           </div>
//         </div>
//       </>
//     );
//   }

//   // Auth Forms View (Not Logged In)
//   return (
//     <>
//       <ToastContainer toasts={toasts} removeToast={removeToast} />
//       <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
//           <div className="text-center mb-8">
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
//               Admin Portal
//             </h1>
//             <p className="text-gray-600">Secure authentication system</p>
//           </div>

//           {/* Email Verification Alert */}
//           {showEmailVerificationAlert && (
//             <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
//               <div className="flex items-start gap-3">
//                 <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
//                 <div className="flex-1">
//                   <h3 className="font-semibold text-orange-900 mb-1">Email Not Verified</h3>
//                   <p className="text-sm text-orange-800 mb-3">
//                     Please verify your email address to continue. Check your inbox at <strong>{unverifiedUserEmail}</strong>
//                   </p>
//                   <button
//                     onClick={handleResendVerification}
//                     disabled={loading}
//                     className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {loading ? (
//                       <>
//                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                         Sending...
//                       </>
//                     ) : (
//                       <>
//                         <RefreshCw className="w-4 h-4" />
//                         Resend Verification Email
//                       </>
//                     )}
//                   </button>
//                 </div>
//                 <button
//                   onClick={() => setShowEmailVerificationAlert(false)}
//                   className="text-orange-600 hover:text-orange-800 transition"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Tab Switcher */}
//           <div className="flex gap-2 mb-6">
//             <button
//               onClick={() => {
//                 setCurrentView('login');
//                 setLoginErrors({});
//                 setRegisterErrors({});
//                 setShowEmailVerificationAlert(false);
//               }}
//               className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
//                 currentView === 'login'
//                   ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
//                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//               }`}
//             >
//               <LogIn className="w-5 h-5" />
//               Login
//             </button>
//             <button
//               onClick={() => {
//                 setCurrentView('register');
//                 setLoginErrors({});
//                 setRegisterErrors({});
//                 setShowEmailVerificationAlert(false);
//               }}
//               className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
//                 currentView === 'register'
//                   ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
//                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//               }`}
//             >
//               <UserPlus className="w-5 h-5" />
//               Register
//             </button>
//           </div>

//           {/* Login Form */}
//           {currentView === 'login' && (
//             <form onSubmit={handleLogin} className="space-y-5">
//               {/* Email Field */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="email"
//                     value={loginForm.email}
//                     onChange={(e) => {
//                       setLoginForm({ ...loginForm, email: e.target.value });
//                       if (loginErrors.email) {
//                         setLoginErrors({ ...loginErrors, email: '' });
//                       }
//                     }}
//                     className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
//                       loginErrors.email ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="you@example.com"
//                   />
//                 </div>
//                 {loginErrors.email && (
//                   <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                     <AlertCircle className="w-4 h-4" />
//                     {loginErrors.email}
//                   </p>
//                 )}
//               </div>

//               {/* Password Field */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={loginForm.password}
//                     onChange={(e) => {
//                       setLoginForm({ ...loginForm, password: e.target.value });
//                       if (loginErrors.password) {
//                         setLoginErrors({ ...loginErrors, password: '' });
//                       }
//                     }}
//                     className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
//                       loginErrors.password ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="••••••••"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//                 {loginErrors.password && (
//                   <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                     <AlertCircle className="w-4 h-4" />
//                     {loginErrors.password}
//                   </p>
//                 )}
//               </div>

//               {/* Remember Me */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="remember"
//                     checked={loginForm.remember}
//                     onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
//                     className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//                   />
//                   <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
//                     Remember me for 30 days
//                   </label>
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {loading ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Logging in...
//                   </>
//                 ) : (
//                   <>
//                     <LogIn className="w-5 h-5" />
//                     Login
//                   </>
//                 )}
//               </button>
//             </form>
//           )}

//           {/* Register Form */}
//           {currentView === 'register' && (
//             <form onSubmit={handleRegister} className="space-y-5">
//               {/* Name Field */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Full Name
//                 </label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="text"
//                     value={registerForm.name}
//                     onChange={(e) => {
//                       setRegisterForm({ ...registerForm, name: e.target.value });
//                       if (registerErrors.name) {
//                         setRegisterErrors({ ...registerErrors, name: '' });
//                       }
//                     }}
//                     className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
//                       registerErrors.name ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="John Doe"
//                   />
//                 </div>
//                 {registerErrors.name && (
//                   <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                     <AlertCircle className="w-4 h-4" />
//                     {registerErrors.name}
//                   </p>
//                 )}
//               </div>

//               {/* Email Field */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="email"
//                     value={registerForm.email}
//                     onChange={(e) => {
//                       setRegisterForm({ ...registerForm, email: e.target.value });
//                       if (registerErrors.email) {
//                         setRegisterErrors({ ...registerErrors, email: '' });
//                       }
//                     }}
//                     className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
//                       registerErrors.email ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="you@example.com"
//                   />
//                 </div>
//                 {registerErrors.email && (
//                   <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                     <AlertCircle className="w-4 h-4" />
//                     {registerErrors.email}
//                   </p>
//                 )}
//               </div>

//               {/* Password Field */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={registerForm.password}
//                     onChange={(e) => {
//                       setRegisterForm({ ...registerForm, password: e.target.value });
//                       if (registerErrors.password) {
//                         setRegisterErrors({ ...registerErrors, password: '' });
//                       }
//                     }}
//                     className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
//                       registerErrors.password ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="••••••••"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//                 {registerErrors.password && (
//                   <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                     <AlertCircle className="w-4 h-4" />
//                     {registerErrors.password}
//                   </p>
//                 )}
//               </div>

//               {/* Confirm Password Field */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Confirm Password
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={registerForm.passwordConfirmation}
//                     onChange={(e) => {
//                       setRegisterForm({ ...registerForm, passwordConfirmation: e.target.value });
//                       if (registerErrors.passwordConfirmation) {
//                         setRegisterErrors({ ...registerErrors, passwordConfirmation: '' });
//                       }
//                     }}
//                     className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
//                       registerErrors.passwordConfirmation ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="••••••••"
//                   />
//                 </div>
//                 {registerErrors.passwordConfirmation && (
//                   <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                     <AlertCircle className="w-4 h-4" />
//                     {registerErrors.passwordConfirmation}
//                   </p>
//                 )}
//               </div>

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {loading ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Creating account...
//                   </>
//                 ) : (
//                   <>
//                     <UserPlus className="w-5 h-5" />
//                     Create Account
//                   </>
//                 )}
//               </button>
//             </form>
//           )}
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes slideIn {
//           from {
//             transform: translateX(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateX(0);
//             opacity: 1;
//           }
//         }
//         .animate-slideIn {
//           animation: slideIn 0.3s ease-out;
//         }
//       `}</style>
//     </>
//   );
// }

import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, LogIn, UserPlus, LogOut, Eye, EyeOff, X, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, KeyRound } from 'lucide-react';

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slideIn z-50`}>
      {icons[type]}
      <p className="flex-1 font-medium">{message}</p>
      <button onClick={onClose} className="hover:bg-white/20 rounded p-1 transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// API Service
const API_URL = 'http://localhost:8000/api';

const authService = {
  async register(name, email, password, passwordConfirmation) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      }),
    });
    return await response.json();
  },

  async login(email, password, remember = false) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password, remember }),
    });
    return await response.json();
  },

  async logout(token) {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return await response.json();
  },

  async getUser(token) {
    const response = await fetch(`${API_URL}/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return await response.json();
  },

  async resendVerification(email) {
    const response = await fetch(`${API_URL}/email/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  },

  async forgotPassword(email) {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  },

  async resetPassword(email, password, passwordConfirmation, token) {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        password_confirmation: passwordConfirmation,
        token,
      }),
    });
    return await response.json();
  },
};

// Main Auth Component
export default function AuthComponent() {
  const [currentView, setCurrentView] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showEmailVerificationAlert, setShowEmailVerificationAlert] = useState(false);
  const [unverifiedUserEmail, setUnverifiedUserEmail] = useState('');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });

  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: '',
  });

  const [resetPasswordForm, setResetPasswordForm] = useState({
    email: '',
    password: '',
    passwordConfirmation: '',
    token: '',
  });

  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const [forgotPasswordErrors, setForgotPasswordErrors] = useState({});
  const [resetPasswordErrors, setResetPasswordErrors] = useState({});

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    }

    // Check for reset password token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token_param = urlParams.get('token');
    const email = urlParams.get('email');
    if (token_param && email) {
      setCurrentView('reset-password');
      setResetPasswordForm({ ...resetPasswordForm, token: token_param, email: email });
    }
  }, []);

  // Toast functions
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateLoginForm = () => {
    const errors = {};

    if (!loginForm.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(loginForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!loginForm.password) {
      errors.password = 'Password is required';
    } else if (loginForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors = {};

    if (!registerForm.name) {
      errors.name = 'Name is required';
    } else if (registerForm.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!registerForm.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(registerForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!registerForm.password) {
      errors.password = 'Password is required';
    } else if (registerForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!registerForm.passwordConfirmation) {
      errors.passwordConfirmation = 'Please confirm your password';
    } else if (registerForm.password !== registerForm.passwordConfirmation) {
      errors.passwordConfirmation = 'Passwords do not match';
    }

    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateForgotPasswordForm = () => {
    const errors = {};

    if (!forgotPasswordForm.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(forgotPasswordForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setForgotPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateResetPasswordForm = () => {
    const errors = {};

    if (!resetPasswordForm.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(resetPasswordForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!resetPasswordForm.password) {
      errors.password = 'Password is required';
    } else if (resetPasswordForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!resetPasswordForm.passwordConfirmation) {
      errors.passwordConfirmation = 'Please confirm your password';
    } else if (resetPasswordForm.password !== resetPasswordForm.passwordConfirmation) {
      errors.passwordConfirmation = 'Passwords do not match';
    }

    setResetPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      addToast('Please fix the form errors', 'error');
      return;
    }

    setLoading(true);
    setShowEmailVerificationAlert(false);

    try {
      const response = await authService.login(
        loginForm.email,
        loginForm.password,
        loginForm.remember
      );

      if (response.success) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('expires_at', response.data.expires_at);
        
        setIsLoggedIn(true);
        setUser(response.data.user);
        setLoginForm({ email: '', password: '', remember: false });
        setLoginErrors({});
        
        addToast(response.message || 'Login successful!', 'success');
      } else {
        // Check if email is not verified (403 status)
        if (response.email_verified === false) {
          setShowEmailVerificationAlert(true);
          setUnverifiedUserEmail(loginForm.email);
          addToast(response.message || 'Please verify your email address', 'error');
        } else {
          if (response.errors) {
            setLoginErrors(response.errors);
          }
          addToast(response.message || 'Login failed', 'error');
        }
      }
    } catch (error) {
      addToast('An error occurred during login', 'error');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend Verification Email
  const handleResendVerification = async () => {
    setLoading(true);

    try {
      const response = await authService.resendVerification(unverifiedUserEmail);

      if (response.success) {
        addToast('Verification email sent! Please check your inbox.', 'success');
      } else {
        addToast(response.message || 'Failed to send verification email', 'error');
      }
    } catch (error) {
      addToast('An error occurred while sending verification email', 'error');
      console.error('Resend verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateRegisterForm()) {
      addToast('Please fix the form errors', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(
        registerForm.name,
        registerForm.email,
        registerForm.password,
        registerForm.passwordConfirmation
      );

      if (response.success) {
        setRegisterForm({ name: '', email: '', password: '', passwordConfirmation: '' });
        setRegisterErrors({});
        
        addToast(response.message || 'Registration successful! Please check your email to verify your account.', 'success');
        
        // Switch to login view and show verification alert
        setCurrentView('login');
        setShowEmailVerificationAlert(true);
        setUnverifiedUserEmail(response.data.user.email);
      } else {
        if (response.errors) {
          setRegisterErrors(response.errors);
          const errorMessages = Object.values(response.errors).flat();
          addToast(errorMessages[0] || 'Registration failed', 'error');
        } else {
          addToast(response.message || 'Registration failed', 'error');
        }
      }
    } catch (error) {
      addToast('An error occurred during registration', 'error');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!validateForgotPasswordForm()) {
      addToast('Please fix the form errors', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword(forgotPasswordForm.email);

      if (response.success) {
        setForgotPasswordForm({ email: '' });
        setForgotPasswordErrors({});
        addToast(response.message || 'Password reset link sent to your email!', 'success');
      } else {
        if (response.errors) {
          setForgotPasswordErrors(response.errors);
          const errorMessages = Object.values(response.errors).flat();
          addToast(errorMessages[0] || 'Failed to send reset link', 'error');
        } else {
          addToast(response.message || 'Failed to send reset link', 'error');
        }
      }
    } catch (error) {
      addToast('An error occurred while sending reset link', 'error');
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!validateResetPasswordForm()) {
      addToast('Please fix the form errors', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(
        resetPasswordForm.email,
        resetPasswordForm.password,
        resetPasswordForm.passwordConfirmation,
        resetPasswordForm.token
      );

      if (response.success) {
        setResetPasswordForm({ email: '', password: '', passwordConfirmation: '', token: '' });
        setResetPasswordErrors({});
        addToast(response.message || 'Password reset successful! You can now login.', 'success');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          setCurrentView('login');
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 2000);
      } else {
        if (response.errors) {
          setResetPasswordErrors(response.errors);
          const errorMessages = Object.values(response.errors).flat();
          addToast(errorMessages[0] || 'Failed to reset password', 'error');
        } else {
          addToast(response.message || 'Failed to reset password', 'error');
        }
      }
    } catch (error) {
      addToast('An error occurred while resetting password', 'error');
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await authService.logout(token);
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('expires_at');
      
      setIsLoggedIn(false);
      setUser(null);
      setCurrentView('login');
      
      addToast('Logged out successfully', 'success');
    } catch (error) {
      addToast('Logout failed', 'error');
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dashboard View (Logged In)
  if (isLoggedIn && user) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
              <p className="text-gray-600 mt-2">You are logged in</p>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border border-indigo-100">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Name</p>
                  <p className="text-lg font-semibold text-gray-800">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                  <p className="text-lg font-semibold text-gray-800">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Email Status</p>
                  <p className="text-lg font-semibold">
                    {user.email_verified_at ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-5 h-5" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-orange-600 flex items-center gap-1">
                        <AlertCircle className="w-5 h-5" />
                        Not Verified
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Member Since</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-5 h-5" />
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </>
    );
  }

  // Auth Forms View (Not Logged In)
  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Admin Portal
            </h1>
            <p className="text-gray-600">Secure authentication system</p>
          </div>

          {/* Email Verification Alert */}
          {showEmailVerificationAlert && currentView === 'login' && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-1">Email Not Verified</h3>
                  <p className="text-sm text-orange-800 mb-3">
                    Please verify your email address to continue. Check your inbox at <strong>{unverifiedUserEmail}</strong>
                  </p>
                  <button
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setShowEmailVerificationAlert(false)}
                  className="text-orange-600 hover:text-orange-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Tab Switcher - Only show for login and register */}
          {(currentView === 'login' || currentView === 'register') && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setCurrentView('login');
                  setLoginErrors({});
                  setRegisterErrors({});
                  setShowEmailVerificationAlert(false);
                }}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  currentView === 'login'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <LogIn className="w-5 h-5" />
                Login
              </button>
              <button
                onClick={() => {
                  setCurrentView('register');
                  setLoginErrors({});
                  setRegisterErrors({});
                  setShowEmailVerificationAlert(false);
                }}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  currentView === 'register'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                Register
              </button>
            </div>
          )}

          {/* Login Form */}
          {currentView === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => {
                      setLoginForm({ ...loginForm, email: e.target.value });
                      if (loginErrors.email) {
                        setLoginErrors({ ...loginErrors, email: '' });
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                      loginErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {loginErrors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {loginErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => {
                      setLoginForm({ ...loginForm, password: e.target.value });
                      if (loginErrors.password) {
                        setLoginErrors({ ...loginErrors, password: '' });
                      }
                    }}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                      loginErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {loginErrors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={loginForm.remember}
                    onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView('forgot-password')}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Login
                  </>
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {currentView === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, name: e.target.value });
                      if (registerErrors.name) {
                        setRegisterErrors({ ...registerErrors, name: '' });
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                      registerErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {registerErrors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {registerErrors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, email: e.target.value });
                      if (registerErrors.email) {
                        setRegisterErrors({ ...registerErrors, email: '' });
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                      registerErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {registerErrors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {registerErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, password: e.target.value });
                      if (registerErrors.password) {
                        setRegisterErrors({ ...registerErrors, password: '' });
                      }
                    }}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                      registerErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {registerErrors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {registerErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.passwordConfirmation}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, passwordConfirmation: e.target.value });
                      if (registerErrors.passwordConfirmation) {
                        setRegisterErrors({ ...registerErrors, passwordConfirmation: '' });
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                      registerErrors.passwordConfirmation ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {registerErrors.passwordConfirmation && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {registerErrors.passwordConfirmation}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {currentView === 'forgot-password' && (
            <div>
              <button
                onClick={() => setCurrentView('login')}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Login
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
                <p className="text-gray-600 text-sm">Enter your email to receive a password reset link</p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={forgotPasswordForm.email}
                      onChange={(e) => {
                        setForgotPasswordForm({ email: e.target.value });
                        if (forgotPasswordErrors.email) {
                          setForgotPasswordErrors({ ...forgotPasswordErrors, email: '' });
                        }
                      }}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                        forgotPasswordErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {forgotPasswordErrors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {forgotPasswordErrors.email}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Reset Password Form */}
          {currentView === 'reset-password' && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
                <p className="text-gray-600 text-sm">Enter your new password</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* Email Field (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={resetPasswordForm.email}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={resetPasswordForm.password}
                      onChange={(e) => {
                        setResetPasswordForm({ ...resetPasswordForm, password: e.target.value });
                        if (resetPasswordErrors.password) {
                          setResetPasswordErrors({ ...resetPasswordErrors, password: '' });
                        }
                      }}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                        resetPasswordErrors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {resetPasswordErrors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {resetPasswordErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={resetPasswordForm.passwordConfirmation}
                      onChange={(e) => {
                        setResetPasswordForm({ ...resetPasswordForm, passwordConfirmation: e.target.value });
                        if (resetPasswordErrors.passwordConfirmation) {
                          setResetPasswordErrors({ ...resetPasswordErrors, passwordConfirmation: '' });
                        }
                      }}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                        resetPasswordErrors.passwordConfirmation ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {resetPasswordErrors.passwordConfirmation && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {resetPasswordErrors.passwordConfirmation}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}