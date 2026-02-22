import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { title } from '../services/helpers';
import TableLoadingSpinner from '../components/common/TableLoadingSpinner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/auth';
import { toast } from 'react-hot-toast';
import { ROUTES } from '../config/routes';
import {
  PencilIcon,
  KeyIcon,
  TrashIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import DeleteConfirmModalUser from '../components/profile/DeleteConfirmModalUser';

// ─── Constants ────────────────────────────────────────────────────────────────

const EMAIL_RE           = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
const AVATAR_MAX_BYTES   = 2 * 1024 * 1024;
const DELETE_PHRASE      = 'DELETE MY ACCOUNT';

const TABS = [
  { key: 'profile',  label: 'Personal Info',    icon: PencilIcon },
  { key: 'password', label: 'Change Password',  icon: KeyIcon },
  { key: 'danger',   label: 'Danger Zone',      icon: ExclamationTriangleIcon },
];

// ─── Validators ───────────────────────────────────────────────────────────────

const validateProfileForm = (form, avatarFile) => {
  const errors = {};
  const name  = form.name.trim();
  const email = form.email.trim();

  if (!name)               errors.name  = 'Full name is required.';
  else if (name.length < 2)  errors.name  = 'Name must be at least 2 characters.';
  else if (name.length > 100) errors.name = 'Name must not exceed 100 characters.';

  if (!email)                    errors.email = 'Email address is required.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';
  else if (email.length > 255)    errors.email = 'Email must not exceed 255 characters.';

  if (avatarFile) {
    if (!ALLOWED_MIME_TYPES.includes(avatarFile.type))
      errors.avatar = 'Avatar must be a JPEG, PNG, JPG, GIF or WEBP file.';
    else if (avatarFile.size > AVATAR_MAX_BYTES)
      errors.avatar = 'Avatar may not be greater than 2 MB.';
  }

  return errors;
};

const validatePasswordForm = (form) => {
  const errors = {};

  if (!form.current_password)
    errors.current_password = 'Please enter your current password.';

  if (!form.password)
    errors.password = 'New password is required.';
  else if (form.password.length < 8)
    errors.password = 'Password must be at least 8 characters.';
  else if (!/[a-z]/.test(form.password))
    errors.password = 'Password must contain at least one lowercase letter.';
  else if (!/[A-Z]/.test(form.password))
    errors.password = 'Password must contain at least one uppercase letter.';
  else if (!/[0-9]/.test(form.password))
    errors.password = 'Password must contain at least one number.';

  if (!form.password_confirmation)
    errors.password_confirmation = 'Please confirm your new password.';
  else if (form.password && form.password !== form.password_confirmation)
    errors.password_confirmation = 'Password confirmation does not match.';

  return errors;
};

const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)          score++;
  if (/[a-z]/.test(pwd))        score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;

  const levels = [
    { label: '',            color: '' },
    { label: 'Very Weak',   color: 'bg-red-500' },
    { label: 'Weak',        color: 'bg-orange-400' },
    { label: 'Fair',        color: 'bg-yellow-400' },
    { label: 'Strong',      color: 'bg-green-400' },
    { label: 'Very Strong', color: 'bg-green-600' },
  ];
  return { score, ...levels[score] };
};

const PASSWORD_RULES = [
  { test: (p) => p.length >= 8,   label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter'  },
  { test: (p) => /[a-z]/.test(p), label: 'One lowercase letter'  },
  { test: (p) => /[0-9]/.test(p), label: 'One number'            },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────

const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
      <ExclamationTriangleIcon className="w-3 h-3 flex-shrink-0" />
      {message}
    </p>
  ) : null;

const InputField = ({ label, error, touched, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
    </label>
    <input
      className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-700
        text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
        focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
        error && touched
          ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
          : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
      }`}
      {...props}
    />
    {touched && <FieldError message={error} />}
  </div>
);

const PasswordInput = ({ label, error, touched, ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className={`w-full px-4 py-2.5 pr-10 text-sm border rounded-lg bg-white dark:bg-gray-700
            text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
            error && touched
              ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
              : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          {show ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
        </button>
      </div>
      {touched && <FieldError message={error} />}
    </div>
  );
};

const SubmitButton = ({ loading, label = 'Save Changes', icon: Icon = CheckIcon }) => (
  <button
    type="submit"
    disabled={loading}
    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60
      disabled:cursor-not-allowed text-white rounded-lg transition duration-200
      font-medium text-sm flex items-center gap-2"
  >
    {loading ? <LoadingSpinner size="sm" /> : <Icon className="w-4 h-4" />}
    {loading ? 'Saving...' : label}
  </button>
);

// ─── Profile Page ─────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { setUser} = useAuth();
  const fileInputRef = useRef(null);

  const [loading,   setLoading]   = useState(true);
  const [profile,   setProfile]   = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // ── Modals ────────────────────────────────────────────────────────────────
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showRemoveAvatarModal,  setShowRemoveAvatarModal]  = useState(false);

  // ── Modal loading states (passed to DeleteConfirmModalUser) ───────────────
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const [deleteLoading,  setDeleteLoading]  = useState(false);

  // ── Profile form ──────────────────────────────────────────────────────────
  const [profileForm,    setProfileForm]    = useState({ name: '', email: '' });
  const [profileErrors,  setProfileErrors]  = useState({});
  const [profileTouched, setProfileTouched] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Avatar ────────────────────────────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile,    setAvatarFile]    = useState(null);

  // ── Password form ─────────────────────────────────────────────────────────
  const [passwordForm,    setPasswordForm]    = useState({ current_password: '', password: '', password_confirmation: '' });
  const [passwordErrors,  setPasswordErrors]  = useState({});
  const [passwordTouched, setPasswordTouched] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ── Delete account ────────────────────────────────────────────────────────
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    document.title = title('My Profile');
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getProfile();
      setProfile(data);
      setProfileForm({ name: data.name, email: data.email });
    } catch {
      toast.error('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const syncUserContext = (updatedUser) => {
    setProfile(updatedUser);
    setUser(updatedUser);
  };

  const applyServerErrors = (err, setErrors, setTouched, fields) => {
    const raw    = err?.response?.data?.errors ?? {};
    const mapped = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
    );
    setErrors(mapped);
    setTouched(Object.fromEntries(fields.map(f => [f, true])));
    toast.error(err?.response?.data?.message ?? 'Something went wrong.');
  };

  // ─────────────────────────────────────────────── Profile ─────────────────

  const handleProfileChange = (field, value) => {
    const updated = { ...profileForm, [field]: value };
    setProfileForm(updated);
    if (profileTouched[field])
      setProfileErrors(validateProfileForm(updated, avatarFile));
  };

  const handleProfileBlur = (field) => {
    setProfileTouched(prev => ({ ...prev, [field]: true }));
    setProfileErrors(validateProfileForm(profileForm, avatarFile));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileTouched({ name: true, email: true, avatar: true });
    const errs = validateProfileForm(profileForm, avatarFile);
    setProfileErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setProfileLoading(true);
    try {
      const fd = new FormData();
      fd.append('name',  profileForm.name.trim());
      fd.append('email', profileForm.email.trim());
      if (avatarFile) fd.append('avatar', avatarFile);

      const res = await authService.updateProfile(fd);
      if (res.success) {
        syncUserContext(res.data.user);
        setAvatarFile(null);
        setAvatarPreview(null);
        setProfileTouched({});
        setProfileErrors({});
        toast.success(res.message ?? 'Profile updated successfully.');
      }
    } catch (err) {
      applyServerErrors(err, setProfileErrors, setProfileTouched, ['name', 'email', 'avatar']);
    } finally {
      setProfileLoading(false);
    }
  };

  // ─────────────────────────────────────────────── Avatar ──────────────────

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setProfileErrors(prev => ({ ...prev, avatar: 'Avatar must be a JPEG, PNG, JPG, GIF or WEBP file.' }));
      setProfileTouched(prev => ({ ...prev, avatar: true }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setProfileErrors(prev => ({ ...prev, avatar: 'Avatar may not be greater than 2 MB.' }));
      setProfileTouched(prev => ({ ...prev, avatar: true }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setProfileErrors(prev => { const e = { ...prev }; delete e.avatar; return e; });
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleCancelAvatarPreview = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setProfileErrors(prev => { const e = { ...prev }; delete e.avatar; return e; });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Called by DeleteConfirmModalUser onConfirm for avatar removal
  const handleRemoveAvatarConfirm = async () => {
    setAvatarRemoving(true);
    try {
      const res = await authService.removeAvatar();
      if (res.success) {
        syncUserContext(res.data.user);
        toast.success(res.message ?? 'Avatar removed.');
        setShowRemoveAvatarModal(false);
      }
    } catch {
      toast.error('Failed to remove avatar.');
    } finally {
      setAvatarRemoving(false);
    }
  };

  // ─────────────────────────────────────────────── Password ────────────────

  const handlePasswordChange = (field, value) => {
    const updated = { ...passwordForm, [field]: value };
    setPasswordForm(updated);
    if (passwordTouched[field])
      setPasswordErrors(validatePasswordForm(updated));
  };

  const handlePasswordBlur = (field) => {
    setPasswordTouched(prev => ({ ...prev, [field]: true }));
    setPasswordErrors(validatePasswordForm(passwordForm));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordTouched({ current_password: true, password: true, password_confirmation: true });
    const errs = validatePasswordForm(passwordForm);
    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPasswordLoading(true);
    try {
      const res = await authService.changePassword(passwordForm);
      if (res.success) {
        setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
        setPasswordTouched({});
        setPasswordErrors({});
        toast.success(res.message ?? 'Password changed successfully.');
      }
    } catch (err) {
      applyServerErrors(err, setPasswordErrors, setPasswordTouched,
        ['current_password', 'password', 'password_confirmation']);
    } finally {
      setPasswordLoading(false);
    }
  };

  // ─────────────────────────────────────────────── Delete Account ───────────

  // Called by DeleteConfirmModalUser onConfirm for account deletion
  const handleDestroyAccountConfirm = async () => {
    setDeleteLoading(true);
    try {
      const res = await authService.destroyAccount();
      if (res.success) {
        setShowDeleteAccountModal(false);
        toast.success('Your account has been permanently deleted. Redirecting...');
        setUser(null);
      }
    } catch {
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  const currentAvatarSrc = avatarPreview ?? profile?.avatar_url;
  const strength         = getPasswordStrength(passwordForm.password);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div>
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            My Profile
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your personal information and account security
          </p>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <TableLoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start xl:items-stretch">

            {/* ── Left Column: Profile Card ─────────────────────────────── */}
            <div className="xl:col-span-1 flex flex-col">
              <div className="flex flex-col flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Banner */}
                <div className="h-24 bg-gradient-to-r from-primary-500 to-primary-600" />

                <div className="px-6 pb-6 -mt-12">
                  {/* Avatar */}
                  <div className="relative inline-block">
                    {currentAvatarSrc ? (
                      <img
                        src={currentAvatarSrc}
                        alt={profile?.name}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-md"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white dark:ring-gray-800 shadow-md">
                        {profile?.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                      title="Change avatar"
                    >
                      <CameraIcon className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>

                  {/* Avatar pending notice */}
                  {avatarPreview && (
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        New avatar selected — save to apply.
                      </span>
                      <button
                        type="button"
                        onClick={handleCancelAvatarPreview}
                        className="ml-auto p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Remove avatar — opens DeleteConfirmModalUser */}
                  {!avatarPreview && profile?.avatar && (
                    <button
                      type="button"
                      onClick={() => setShowRemoveAvatarModal(true)}
                      className="mt-3 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                      Remove avatar
                    </button>
                  )}

                  <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white capitalize">
                    {profile?.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>

                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <ShieldCheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Status:{' '}
                      <span className={profile?.status ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                        {profile?.status ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <EnvelopeIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      <span className="truncate">{profile?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CalendarDaysIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      Joined{' '}
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })
                        : '—'}
                    </div>
                  </div>

                  {/* ── Vertical Tab Nav ─────────────────────────────── */}
                  <nav className="mt-6 space-y-1">
                    {TABS.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveTab(key)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                          activeTab === key
                            ? key === 'danger'
                              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                              : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {label}
                        {key === 'danger' && (
                          <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-500">
                            ⚠
                          </span>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* ── Right Column: Single Tab Panel ───────────────────────── */}
            <div className="xl:col-span-2 flex flex-col">
              <div className="flex flex-col flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

                {/* Tab header */}
                <div className={`px-6 py-4 border-b flex items-center gap-3 ${
                  activeTab === 'danger'
                    ? 'border-red-100 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/10'
                    : 'border-gray-100 dark:border-gray-700'
                }`}>
                  {(() => {
                    const tab = TABS.find(t => t.key === activeTab);
                    const Icon = tab?.icon;
                    return (
                      <>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          activeTab === 'danger'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        }`}>
                          {Icon && <Icon className="w-5 h-5" />}
                        </div>
                        <div>
                          <h2 className={`text-base font-semibold ${
                            activeTab === 'danger'
                              ? 'text-red-700 dark:text-red-400'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {tab?.label}
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activeTab === 'profile'  && 'Update your name, email and avatar'}
                            {activeTab === 'password' && 'Keep your account secure with a strong password'}
                            {activeTab === 'danger'   && 'Permanent and irreversible actions'}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* ── Tab: Personal Info ─────────────────────────────── */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileSubmit} noValidate className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <InputField
                        label="Full Name"
                        type="text"
                        placeholder="John Doe"
                        value={profileForm.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        onBlur={() => handleProfileBlur('name')}
                        error={profileErrors.name}
                        touched={profileTouched.name}
                      />
                      <InputField
                        label="Email Address"
                        type="text"
                        placeholder="john@example.com"
                        value={profileForm.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        onBlur={() => handleProfileBlur('email')}
                        error={profileErrors.email}
                        touched={profileTouched.email}
                      />
                    </div>

                    {/* Avatar upload row */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Avatar
                      </label>
                      <div className="flex items-center gap-4">
                        {currentAvatarSrc ? (
                          <img src={currentAvatarSrc} alt="preview"
                            className="w-14 h-14 rounded-full object-cover border-2 border-primary-100 dark:border-primary-900" />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
                            {profile?.name?.charAt(0).toUpperCase() ?? '?'}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button type="button" onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors">
                            <CameraIcon className="w-4 h-4" />
                            {avatarPreview ? 'Change' : 'Upload'}
                          </button>
                          {avatarPreview && (
                            <button type="button" onClick={handleCancelAvatarPreview}
                              className="px-3 py-2 border border-red-300 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                              <XMarkIcon className="w-4 h-4" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                      {profileErrors.avatar && profileTouched.avatar && (
                        <FieldError message={profileErrors.avatar} />
                      )}
                      <p className="mt-1.5 text-xs text-gray-400">
                        Accepted: JPEG, PNG, JPG, GIF, WEBP · Max 2 MB
                      </p>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
                      <SubmitButton loading={profileLoading} label="Save Profile" icon={CheckIcon} />
                    </div>
                  </form>
                )}

                {/* ── Tab: Change Password ───────────────────────────── */}
                {activeTab === 'password' && (
                  <form onSubmit={handlePasswordSubmit} noValidate className="p-6 space-y-5">
                    <PasswordInput
                      label="Current Password"
                      placeholder="Enter your current password"
                      value={passwordForm.current_password}
                      onChange={(e) => handlePasswordChange('current_password', e.target.value)}
                      onBlur={() => handlePasswordBlur('current_password')}
                      error={passwordErrors.current_password}
                      touched={passwordTouched.current_password}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <PasswordInput
                          label="New Password"
                          placeholder="Min. 8 characters"
                          value={passwordForm.password}
                          onChange={(e) => handlePasswordChange('password', e.target.value)}
                          onBlur={() => handlePasswordBlur('password')}
                          error={passwordErrors.password}
                          touched={passwordTouched.password}
                        />
                        {passwordForm.password && (
                          <div className="space-y-1 pt-1">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(i => (
                                <div key={i}
                                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                                    i <= strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-gray-400">
                              Strength:{' '}
                              <span className={
                                strength.score <= 2 ? 'text-red-500 font-medium' :
                                strength.score === 3 ? 'text-yellow-500 font-medium' :
                                'text-green-500 font-medium'
                              }>
                                {strength.label}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      <PasswordInput
                        label="Confirm New Password"
                        placeholder="Repeat your new password"
                        value={passwordForm.password_confirmation}
                        onChange={(e) => handlePasswordChange('password_confirmation', e.target.value)}
                        onBlur={() => handlePasswordBlur('password_confirmation')}
                        error={passwordErrors.password_confirmation}
                        touched={passwordTouched.password_confirmation}
                      />
                    </div>

                    {/* Live requirements checklist */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">
                        Password requirements:
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {PASSWORD_RULES.map(({ test, label }) => {
                          const passed = test(passwordForm.password);
                          return (
                            <div key={label} className="flex items-center gap-1.5 text-xs">
                              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                passed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                              }`}>
                                {passed && <CheckIcon className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                              </div>
                              <span className={passed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                                {label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
                      <SubmitButton loading={passwordLoading} label="Change Password" icon={ShieldCheckIcon} />
                    </div>
                  </form>
                )}

                {/* ── Tab: Danger Zone ───────────────────────────────── */}
                {activeTab === 'danger' && (
                  <div className="p-6 space-y-5">
                    {/* Warning list */}
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                      <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                        Deleting your account will:
                      </p>
                      <div className="space-y-1">
                        {[
                          'Permanently remove all your personal data',
                          'Delete your avatar from storage',
                          'Revoke all active sessions and tokens',
                          'This action cannot be undone',
                        ].map(item => (
                          <div key={item} className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                            <div className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Confirmation phrase input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        To confirm, type{' '}
                        <span className="font-mono font-bold text-red-600 dark:text-red-400 select-all">
                          {DELETE_PHRASE}
                        </span>{' '}
                        below:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder={DELETE_PHRASE}
                        className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                          placeholder-gray-300 dark:placeholder-gray-600
                          focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                          transition-colors font-mono"
                      />
                      {deleteConfirmText && deleteConfirmText !== DELETE_PHRASE && (
                        <FieldError message={`Text does not match. Please type exactly: ${DELETE_PHRASE}`} />
                      )}
                    </div>

                    <div className="flex justify-end pt-2 border-t border-red-100 dark:border-red-900/40">
                      <button
                        type="button"
                        onClick={() => setShowDeleteAccountModal(true)}
                        disabled={deleteConfirmText !== DELETE_PHRASE || deleteLoading}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40
                          disabled:cursor-not-allowed text-white rounded-lg transition duration-200
                          font-medium text-sm flex items-center gap-2"
                      >
                        {deleteLoading
                          ? <LoadingSpinner size="sm" />
                          : <TrashIcon className="w-4 h-4" />
                        }
                        {deleteLoading ? 'Deleting...' : 'Delete My Account'}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Remove Avatar Confirmation Modal ─────────────────────────────── */}
      {showRemoveAvatarModal && (
        <DeleteConfirmModalUser
          title="Remove Avatar"
          entityName="avatar"
          itemLabel="your avatar"
          warningMessage="Your avatar image will be permanently deleted from storage."
          loading={avatarRemoving}
          onClose={() => setShowRemoveAvatarModal(false)}
          onConfirm={handleRemoveAvatarConfirm}
        />
      )}

      {/* ── Delete Account Confirmation Modal ────────────────────────────── */}
      {showDeleteAccountModal && (
        <DeleteConfirmModalUser
          title="Delete Account"
          entityName="account"
          itemLabel="your account"
          warningMessage="All your data, avatar, and active sessions will be permanently removed. This cannot be undone."
          loading={deleteLoading}
          onClose={() => setShowDeleteAccountModal(false)}
          onConfirm={handleDestroyAccountConfirm}
        />
      )}
    </DashboardLayout>
  );
};

export default ProfilePage;