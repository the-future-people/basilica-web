// ─── BASILICA API MODULE ────────────────────────────────────────────
// All API calls in one place — single source of truth

const API_BASE = 'http://127.0.0.1:8001';

const API = {

  // ── Core fetch wrapper ──────────────────────────────────────────
  async request(endpoint, options = {}) {
    const token = AUTH.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    // Token expired — try refresh
    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${AUTH.getToken()}`;
        const retry = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
        if (!retry.ok) throw new Error('Unauthorised');
        return retry.json();
      } else {
        AUTH.logout();
        return;
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Request failed: ${response.status}`);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) return null;
    return response.json();
  },

  // ── Token refresh ───────────────────────────────────────────────
  async refreshToken() {
    const refresh = AUTH.getRefreshToken();
    if (!refresh) return false;
    try {
      const res = await fetch(`${API_BASE}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem('basilica_access', data.access);
      return true;
    } catch {
      return false;
    }
  },

  // ── Auth ────────────────────────────────────────────────────────
  async login(username, password) {
    const res = await fetch(`${API_BASE}/api/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Invalid credentials');
    }
    return res.json();
  },

  async getMe() {
    return this.request('/api/auth/me/');
  },

  // ── Circuits ────────────────────────────────────────────────────
  async getCircuits() {
    return this.request('/api/v1/circuits/');
  },

  async getCircuit(id) {
    return this.request(`/api/v1/circuits/${id}/`);
  },

  async getCircuitStats(id) {
    return this.request(`/api/v1/circuits/${id}/stats/`);
  },

  async getCircuitBins(id) {
    return this.request(`/api/v1/circuits/${id}/bins/`);
  },

  // ── Bins ────────────────────────────────────────────────────────
  async getBins(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/v1/bins/${query ? '?' + query : ''}`);
  },

  async getBin(id) {
    return this.request(`/api/v1/bins/${id}/`);
  },

  async getBinTelemetry(id, limit = 50) {
    return this.request(`/api/v1/bins/${id}/telemetry/?limit=${limit}`);
  },

  async getCriticalBins() {
    return this.request('/api/v1/bins/critical/');
  },

  async getOfflineBins() {
    return this.request('/api/v1/bins/offline/');
  },

  // ── Drivers ────────────────────────────────────────────────────
  async getDrivers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/v1/drivers/${query ? '?' + query : ''}`);
  },

  async getDriver(id) {
    return this.request(`/api/v1/drivers/${id}/`);
  },

  // ── Trips ───────────────────────────────────────────────────────
  async getTrips(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/v1/trips/${query ? '?' + query : ''}`);
  },

  async getTrip(id) {
    return this.request(`/api/v1/trips/${id}/`);
  },

  async startTrip(id) {
    return this.request(`/api/v1/trips/${id}/start/`, { method: 'POST' });
  },

  async completeTrip(id) {
    return this.request(`/api/v1/trips/${id}/complete/`, { method: 'POST' });
  },

  async collectStop(tripId, stopId, notes = '') {
    return this.request(
      `/api/v1/trips/${tripId}/stops/${stopId}/collect/`,
      { method: 'POST', body: JSON.stringify({ notes }) }
    );
  },

  async skipStop(tripId, stopId, notes = '') {
    return this.request(
      `/api/v1/trips/${tripId}/stops/${stopId}/skip/`,
      { method: 'POST', body: JSON.stringify({ notes }) }
    );
  },

  // ── Routes ──────────────────────────────────────────────────────
  async getRoutes(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/v1/routes/${query ? '?' + query : ''}`);
  },

  async getRoute(id) {
    return this.request(`/api/v1/routes/${id}/`);
  },

  async dispatchRoute(id) {
    return this.request(`/api/v1/routes/${id}/dispatch/`, { method: 'POST' });
  },

  // ── Notifications ───────────────────────────────────────────────
  async getNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/v1/notifications/${query ? '?' + query : ''}`);
  },

  async getUnreadCount() {
    return this.request('/api/v1/notifications/unread-count/');
  },

  async markRead(id) {
    return this.request(`/api/v1/notifications/${id}/read/`, { method: 'POST' });
  },

  async markAllRead() {
    return this.request('/api/v1/notifications/read-all/', { method: 'POST' });
  },

  // ── Billing ─────────────────────────────────────────────────────
  async getSubscriptions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/v1/subscriptions/${query ? '?' + query : ''}`);
  },

  async getSubscription(id) {
    return this.request(`/api/v1/subscriptions/${id}/`);
  },

  async getPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/v1/payments/${query ? '?' + query : ''}`);
  }
};