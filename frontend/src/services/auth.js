import axiosInstance from "../config/axios";

class AuthService {
  async register(credentials) {
    const response = await axiosInstance.post('/register', credentials);
    return response.data;
  }

  async login(credentials) {
    const response = await axiosInstance.post('/login', credentials);
    
    if (response.data.success && response.data.data?.access_token) {
      this.setAuthData(response.data.data.access_token, response.data.data.user);
    }
    
    return response.data;
  }

  async logout() {
    try {
      await axiosInstance.post('/logout');
    } finally {
      this.clearAuthData();
    }
  }

  async getCurrentUser() {
    const response = await axiosInstance.get('/user');
    
    if (response.data.success && response.data.data?.user) {
      return response.data.data.user;
    }
    
    throw new Error('Failed to fetch user');
  }

  async resendVerificationEmail(email) {
    const response = await axiosInstance.post('/email/resend', { email });
    return response.data;
  }

  // NEW METHOD - Check email verification status
  async checkVerificationStatus(email) {
    const response = await axiosInstance.post('/email/check-status', { email });
    return response.data;
  }

  async forgotPassword(data) {
    const response = await axiosInstance.post('/forgot-password', data);
    return response.data;
  }

  async validateResetToken(data) {
    const response = await axiosInstance.post('/validate-reset-token', data);
    return response.data;
  }

  async resetPassword(data) {
    const response = await axiosInstance.post('/reset-password', data);
    return response.data;
  }

  setAuthData(token, user) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearAuthData() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export const authService = new AuthService();

export default authService;