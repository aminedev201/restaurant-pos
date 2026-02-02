// Validation Utilities

/**
 * Email validation
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password strength validation
 */
export const validatePassword = (password) => {
  return {
    isValid: password.length >= 8,
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

/**
 * Name validation
 */
export const validateName = (name) => {
  return {
    isValid: name.length >= 2 && name.length <= 255,
    hasMinLength: name.length >= 2,
    hasMaxLength: name.length <= 255,
  };
};

/**
 * Login form validation
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Register form validation
 */
export const validateRegisterForm = (formData) => {
  const errors = {};

  // Name validation
  if (!formData.name) {
    errors.name = 'Name is required';
  } else if (formData.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (formData.name.length > 255) {
    errors.name = 'Name must not exceed 255 characters';
  }

  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  // Password confirmation validation
  if (!formData.passwordConfirmation) {
    errors.passwordConfirmation = 'Please confirm your password';
  } else if (formData.password !== formData.passwordConfirmation) {
    errors.passwordConfirmation = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Get password strength level
 */
export const getPasswordStrength = (password) => {
  const validation = validatePassword(password);
  
  let strength = 0;
  if (validation.hasMinLength) strength++;
  if (validation.hasUpperCase) strength++;
  if (validation.hasLowerCase) strength++;
  if (validation.hasNumber) strength++;
  if (validation.hasSpecialChar) strength++;

  if (strength <= 2) return { level: 'weak', color: 'red', percentage: 33 };
  if (strength <= 3) return { level: 'medium', color: 'yellow', percentage: 66 };
  return { level: 'strong', color: 'green', percentage: 100 };
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input) => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Format API errors for display
 */
export const formatApiErrors = (errors) => {
  if (typeof errors === 'string') {
    return errors;
  }

  if (typeof errors === 'object') {
    return Object.values(errors)
      .flat()
      .join(', ');
  }

  return 'An error occurred';
};