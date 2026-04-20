// ─── BASILICA ROUTER MODULE ─────────────────────────────────────────
// Simple client-side router for page navigation and guards

const ROUTER = {

  // Route definitions — path: { role, redirect }
  routes: {
    '/pages/login.html':       { public: true },
    '/pages/dashboard.html':   { roles: ['admin', 'circuit_admin'] },
    '/pages/bins.html':        { roles: ['admin', 'circuit_admin'] },
    '/pages/trips.html':       { roles: ['admin', 'circuit_admin', 'driver'] },
    '/pages/billing.html':     { roles: ['admin', 'circuit_admin'] },
    '/pages/driver-trip.html': { roles: ['driver'] },
  },

  // Current page path
  currentPath() {
    return window.location.pathname;
  },

  // Navigate to a page
  go(path) {
    window.location.href = path;
  },

  // Navigate back
  back() {
    window.history.back();
  },

  // Guard — call at top of every protected page
  // Returns true if access is allowed, false if redirected
  guard() {
    const path = this.currentPath();
    const route = this.routes[path];

    // Unknown route — allow
    if (!route) return true;

    // Public route — always allow
    if (route.public) return true;

    // Not logged in — redirect to login
    if (!AUTH.isLoggedIn()) {
      this.go('/pages/login.html');
      return false;
    }

    // Check role
    const user = AUTH.getUser();
    if (route.roles && !route.roles.includes(user.role) && !user.is_staff) {
      // Wrong role — redirect to their correct page
      AUTH.redirectByRole();
      return false;
    }

    return true;
  },

  // Redirect after login based on role
  afterLogin() {
    const user = AUTH.getUser();
    if (!user) {
      this.go('/pages/login.html');
      return;
    }
    if (user.role === 'driver') {
      this.go('/pages/driver-trip.html');
    } else {
      this.go('/pages/dashboard.html');
    }
  }
};