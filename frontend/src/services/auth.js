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

  // ─── Profile ────────────────────────────────────────────────────────────────

  async getProfile() {
    const response = await axiosInstance.get('/admin/profile');

    if (response.data.success && response.data.data?.user) {
      this.updateStoredUser(response.data.data.user);
      return response.data.data.user;
    }

    throw new Error('Failed to fetch profile');
  }

  async updateProfile(formData) {
    const response = await axiosInstance.post('/admin/profile/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.success && response.data.data?.user) {
      this.updateStoredUser(response.data.data.user);
    }

    return response.data;
  }

  async changePassword(data) {
    const response = await axiosInstance.post('/admin/profile/change-password', data);
    return response.data;
  }

  async removeAvatar() {
    const response = await axiosInstance.delete('/admin/profile/avatar');
    console.log('ok');
    if (response.data.success && response.data.data?.user) {
      this.updateStoredUser(response.data.data.user);
    }

    return response.data;
  }

  async destroyAccount() {
    const response = await axiosInstance.delete('/admin/profile/destroy');

    if (response.data.success) {
      this.clearAuthData();
    }

    return response.data;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Merge updated fields into the stored user object.
   */
  updateStoredUser(updatedUser) {
    const stored = this.getStoredUser();
    const merged = { ...(stored ?? {}), ...updatedUser };
    localStorage.setItem('user', JSON.stringify(merged));
  }

  setAuthData(token, user) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearAuthData() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('pos_order_items');
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

  async resendVerificationEmail(email) {
    const response = await axiosInstance.post('/email/resend', { email });
    return response.data;
  }

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
}

export const authService = new AuthService();
export default authService;