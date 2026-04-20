// ─── BASILICA AUTH MODULE ───────────────────────────────────────────
// Handles all token storage, retrieval, and session management

const AUTH = {
  ACCESS_KEY: 'basilica_access',
  REFRESH_KEY: 'basilica_refresh',
  USER_KEY: 'basilica_user',

  // Store tokens after successful login
  setSession(data) {
    localStorage.setItem(this.ACCESS_KEY, data.access);
    localStorage.setItem(this.REFRESH_KEY, data.refresh);
    localStorage.setItem(this.USER_KEY, JSON.stringify({
      id: data.user_id,
      username: data.username,
      email: data.email,
      role: data.role,
      circuit_id: data.circuit_id || null,
      is_staff: data.is_staff
    }));
  },

  // Get the access token
  getToken() {
    return localStorage.getItem(this.ACCESS_KEY);
  },

  // Get the refresh token
  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_KEY);
  },

  // Get the current user object
  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  // Check if user is logged in
  isLoggedIn() {
    return !!this.getToken();
  },

  // Check role
  isAdmin() {
    const user = this.getUser();
    return user && (user.role === 'admin' || user.is_staff);
  },

  isDriver() {
    const user = this.getUser();
    return user && user.role === 'driver';
  },

  // Clear everything — logout
  clearSession() {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
  },

  // Logout and redirect to login
  logout() {
    this.clearSession();
    window.location.href = '/pages/login.html';
  },

  // Redirect based on role
  redirectByRole() {
    const user = this.getUser();
    if (!user) {
      window.location.href = '/pages/login.html';
      return;
    }
    if (user.role === 'driver') {
      window.location.href = '/pages/driver-trip.html';
    } else {
      window.location.href = '/pages/dashboard.html';
    }
  },

  // Guard — call at top of every protected page
  // If not logged in, redirect to login
  guard(requiredRole = null) {
    if (!this.isLoggedIn()) {
      window.location.href = '/pages/login.html';
      return false;
    }
    if (requiredRole) {
      const user = this.getUser();
      if (user.role !== requiredRole && !user.is_staff) {
        this.redirectByRole();
        return false;
      }
    }
    return true;
  }
};