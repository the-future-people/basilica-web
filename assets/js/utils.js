// ─── BASILICA UTILS MODULE ──────────────────────────────────────────
// Shared helpers used across all pages

const UTILS = {

  // Format fill level with colour class
  fillClass(level) {
    if (level >= 80) return 'text-red-600';
    if (level >= 60) return 'text-amber-500';
    return 'text-green-600';
  },

  fillBgClass(level) {
    if (level >= 80) return 'bg-red-100 text-red-700';
    if (level >= 60) return 'bg-amber-100 text-amber-700';
    return 'bg-green-100 text-green-700';
  },

  fillBarClass(level) {
    if (level >= 80) return 'bg-red-500';
    if (level >= 60) return 'bg-amber-400';
    return 'bg-green-500';
  },

  fillLabel(level) {
    if (level >= 80) return 'Critical';
    if (level >= 60) return 'Warning';
    return 'Healthy';
  },

  // Status dot colour
  statusDotClass(isOnline) {
    return isOnline ? 'bg-green-500' : 'bg-gray-400';
  },

  // Format date
  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  },

  // Format time
  formatTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit'
    });
  },

  // Format datetime
  formatDateTime(dateStr) {
    if (!dateStr) return '—';
    return `${this.formatDate(dateStr)} · ${this.formatTime(dateStr)}`;
  },

  // Time ago
  timeAgo(dateStr) {
    if (!dateStr) return '—';
    const now = new Date();
    const then = new Date(dateStr);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  },

  // Format GHS currency
  formatGHS(amount) {
    if (amount === null || amount === undefined) return '—';
    return `GHS ${parseFloat(amount).toFixed(2)}`;
  },

  // Truncate text
  truncate(text, length = 40) {
    if (!text) return '—';
    return text.length > length ? text.substring(0, length) + '...' : text;
  },

  // Show a toast notification
  toast(message, type = 'success') {
    const colors = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      warning: 'bg-amber-500',
      info: 'bg-gray-800'
    };
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg text-white text-sm font-medium shadow-lg transition-all duration-300 ${colors[type] || colors.info}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Get URL query param
  getParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  },

  // Set page title
  setTitle(title) {
    document.title = `${title} — Basilica`;
  }
};