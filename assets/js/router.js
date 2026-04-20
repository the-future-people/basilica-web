// ─── BASILICA SPA ROUTER ────────────────────────────────────────────
// Hash-based router. Routes map to view modules.
// Each view must implement: template(), mount(container), unmount()

const ROUTER = {

  // Route definitions
  routes: {
    'overview':  { module: () => OverviewView,  roles: ['admin', 'circuit_admin'] },
    'bins':      { module: () => BinsView,       roles: ['admin', 'circuit_admin'] },
    'trips':     { module: () => TripsView,      roles: ['admin', 'circuit_admin'] },
    'billing':   { module: () => BillingView,    roles: ['admin', 'circuit_admin'] },
  },

  // Currently active view instance
  currentView: null,
  currentRoute: null,

  // Boot the router — call once on app start
  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.resolve());
    // Handle initial load
    this.resolve();
  },

  // Resolve current hash to a view
  resolve() {
    const hash = window.location.hash.replace('#', '') || 'overview';

    // Auth check
    if (!AUTH.isLoggedIn()) {
      window.location.href = '/pages/login.html';
      return;
    }

    const user  = AUTH.getUser();
    const route = this.routes[hash];

    // Unknown route — go to overview
    if (!route) {
      this.go('overview');
      return;
    }

    // Role check
    if (!user.is_staff && !route.roles.includes(user.role)) {
      this.go('overview');
      return;
    }

    // Same route — do nothing
    if (this.currentRoute === hash) return;

    this.currentRoute = hash;
    this.loadView(hash, route);
  },

  // Navigate to a route
  go(route) {
    window.location.hash = route;
  },

  // Load and render a view
  async loadView(name, route) {
    const container = document.getElementById('view-container');
    if (!container) return;

    // Unmount current view
    if (this.currentView && this.currentView.unmount) {
      this.currentView.unmount();
    }

    // Fade out
    container.style.opacity = '0';
    container.style.transform = 'translateY(6px)';
    container.style.transition = 'all 0.15s ease';

    await this.sleep(150);

    // Show loading
    container.innerHTML = `
      <div class="flex items-center justify-center py-24">
        <div class="flex items-center gap-3 bg-white rounded-xl px-6 py-4 border border-gray-200 shadow-sm">
          <svg class="w-5 h-5 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span class="text-sm text-gray-600 font-medium">Loading...</span>
        </div>
      </div>`;

    // Fade in loading
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';

    // Get view module
    const view = route.module();
    this.currentView = view;

    // Mount view
    await view.mount(container);

    // Update active nav
    APP.setActiveNav(name);
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};