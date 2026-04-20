// ─── BASILICA APP ───────────────────────────────────────────────────
// Entry point. Bootstraps the shell and starts the router.

const APP = {

  // Boot the app
  init() {
    // Auth check before anything
    if (!AUTH.isLoggedIn()) {
      window.location.href = '/pages/login.html';
      return;
    }

    const user = AUTH.getUser();

    // Drivers go to their own shell
    if (user.role === 'driver' && !user.is_staff) {
      if (!window.location.pathname.includes('driver.html')) {
        window.location.href = '/driver.html';
      }
      return;
    }

    // Render shell components
    this.renderNavbar();
    this.renderSidebar();
    this.startClock();

    // Start router
    ROUTER.init();
  },

  // Set active nav item
  setActiveNav(route) {
    // Top nav tabs
    document.querySelectorAll('[data-nav]').forEach(el => {
      const isActive = el.dataset.nav === route;
      if (isActive) {
        el.className = el.className
          .replace('text-gray-500 hover:bg-gray-100', '')
          + ' bg-amber-50 text-amber-700 border border-amber-200';
      } else {
        el.className = el.className
          .replace('bg-amber-50 text-amber-700 border border-amber-200', '')
          + ' text-gray-500 hover:bg-gray-100';
      }
    });

    // Sidebar items
    document.querySelectorAll('[data-sidebar]').forEach(el => {
      const isActive = el.dataset.sidebar === route;
      el.classList.toggle('active', isActive);
    });
  },

  // Render top navbar
  renderNavbar() {
    const user = AUTH.getUser();
    const initials = (user?.username || 'U').substring(0, 2).toUpperCase();
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    navbar.innerHTML = `
      <div class="flex items-center justify-between px-5 h-14">

        <!-- Logo + Circuit -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer" onclick="ROUTER.go('overview')">
            <span class="font-display font-bold text-sm text-black">B</span>
          </div>
          <div class="hidden sm:block font-display font-bold text-sm tracking-widest text-gray-900">BASILICA</div>
          <div class="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-3 py-1 ml-1">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wide" id="navCircuitCode">—</span>
            <span class="text-gray-300">·</span>
            <span class="text-xs text-gray-500" id="navCircuitName">Loading...</span>
          </div>
        </div>

        <!-- Nav tabs -->
        <div class="hidden md:flex items-center gap-1">
          <button data-nav="overview" onclick="ROUTER.go('overview')"
            class="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-all">
            Overview
          </button>
          <button data-nav="bins" onclick="ROUTER.go('bins')"
            class="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-all">
            Bins
          </button>
          <button data-nav="trips" onclick="ROUTER.go('trips')"
            class="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-all">
            Trips
          </button>
          <button data-nav="billing" onclick="ROUTER.go('billing')"
            class="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-all">
            Billing
          </button>
        </div>

        <!-- Right -->
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-1.5 text-xs font-medium text-green-600">
            <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            Live
          </div>
          <div class="font-mono text-xs text-gray-400" id="navClock"></div>
          <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center cursor-pointer">
            <span class="text-xs font-bold text-black">${initials}</span>
          </div>
          <button onclick="AUTH.logout()"
            class="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
            </svg>
            Logout
          </button>
        </div>
      </div>`;
  },

  // Render sidebar
  renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.innerHTML = `
      <div class="px-3 flex flex-col gap-1 py-4">

        <div class="text-xs font-semibold uppercase tracking-widest text-gray-400 px-3 mb-1">
          Operations
        </div>

        <button data-sidebar="overview" onclick="ROUTER.go('overview')"
          class="nav-item w-full text-left">
          <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
          </svg>
          Overview
        </button>

        <button data-sidebar="bins" onclick="ROUTER.go('bins')"
          class="nav-item w-full text-left">
          <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
          </svg>
          All Bins
          <span class="ml-auto bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full" id="sidebarBinCount">—</span>
        </button>

        <div class="text-xs font-semibold uppercase tracking-widest text-gray-400 px-3 mb-1 mt-3">
          Collection
        </div>

        <button data-sidebar="trips" onclick="ROUTER.go('trips')"
          class="nav-item w-full text-left">
          <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
          </svg>
          Trips
          <span id="sidebarActiveTrip" class="ml-auto hidden bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Live</span>
        </button>

        <div class="text-xs font-semibold uppercase tracking-widest text-gray-400 px-3 mb-1 mt-3">
          Finance
        </div>

        <button data-sidebar="billing" onclick="ROUTER.go('billing')"
          class="nav-item w-full text-left">
          <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/>
          </svg>
          Billing
        </button>

      </div>

      <!-- Driver card -->
      <div class="mt-auto px-3 pb-4">
        <div id="sidebarDriverCard" class="hidden bg-green-50 border border-green-200 rounded-xl p-3">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span class="text-xs font-semibold text-green-700">Driver on trip</span>
          </div>
          <div class="text-sm font-semibold text-gray-900" id="sidebarDriverName">—</div>
          <div class="text-xs text-gray-500 mt-0.5" id="sidebarDriverInfo">—</div>
        </div>
      </div>`;
  },

  // Load circuit info into navbar
  async loadCircuitInfo() {
    try {
      const data = await API.getCircuits();
      const circuit = data.results?.[0] || data[0];
      if (circuit) {
        const code = document.getElementById('navCircuitCode');
        const name = document.getElementById('navCircuitName');
        if (code) code.textContent = circuit.code;
        if (name) name.textContent = circuit.name.replace('Ayawaso West Circuit 1', 'Ayawaso West');
      }
    } catch (e) {}
  },

  // Clock
  startClock() {
    const tick = () => {
      const el = document.getElementById('navClock');
      if (el) el.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };
    tick();
    setInterval(tick, 30000);
  }
};