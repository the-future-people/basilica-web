// ─── TRIPS VIEW ─────────────────────────────────────────────────────
const TripsView = {

  _trips: [],
  _selectedTrip: null,

  template() {
    const today = new Date().toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    return `
    <div class="flex h-full">

      <!-- LEFT — Trips list -->
      <div class="w-80 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">

        <!-- Header -->
        <div class="px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div class="flex items-center justify-between mb-1">
            <h1 class="font-display text-lg font-bold text-gray-900">Trips</h1>
            <span class="text-xs font-mono text-gray-400" id="trips-count">—</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
            <span class="text-xs text-gray-500">${today}</span>
          </div>
        </div>

        <!-- Status filters -->
        <div class="flex gap-1.5 px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <button onclick="TripsView.setStatusFilter('all',this)"
            class="trips-status-btn flex-1 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-black border border-amber-500 transition-all">
            All
          </button>
          <button onclick="TripsView.setStatusFilter('in_progress',this)"
            class="trips-status-btn flex-1 py-1.5 rounded-lg text-xs font-medium bg-white text-gray-500 border border-gray-200 hover:border-green-300 hover:text-green-600 transition-all">
            Live
          </button>
          <button onclick="TripsView.setStatusFilter('pending',this)"
            class="trips-status-btn flex-1 py-1.5 rounded-lg text-xs font-medium bg-white text-gray-500 border border-gray-200 hover:border-amber-300 hover:text-amber-600 transition-all">
            Pending
          </button>
          <button onclick="TripsView.setStatusFilter('completed',this)"
            class="trips-status-btn flex-1 py-1.5 rounded-lg text-xs font-medium bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all">
            Done
          </button>
        </div>

        <!-- Trips list -->
        <div class="flex-1 overflow-y-auto" id="trips-list">
          <div class="flex items-center justify-center py-16">
            <div class="flex items-center gap-3">
              <svg class="w-4 h-4 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span class="text-sm text-gray-500">Loading trips...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT — Trip detail -->
      <div class="flex-1 flex flex-col bg-gray-50 overflow-hidden" id="trips-detail">
        <div class="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div class="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25"/>
            </svg>
          </div>
          <div class="text-sm font-semibold text-gray-400 mb-1">Select a trip</div>
          <div class="text-xs text-gray-400">Click any trip on the left to view its route and stops</div>
        </div>
      </div>

    </div>`;
  },

  // ── Status helpers ──
  getStatusConfig(status) {
    return {
      in_progress: { label:'In Progress', dot:'bg-green-500', badge:'bg-green-100 text-green-700', pulse: true },
      pending:     { label:'Pending',     dot:'bg-amber-400', badge:'bg-amber-100 text-amber-700', pulse: false },
      completed:   { label:'Completed',   dot:'bg-blue-400',  badge:'bg-blue-100 text-blue-700',   pulse: false },
      cancelled:   { label:'Cancelled',   dot:'bg-gray-400',  badge:'bg-gray-100 text-gray-500',   pulse: false },
    }[status] || { label: status, dot:'bg-gray-400', badge:'bg-gray-100 text-gray-500', pulse: false };
  },

  // ── Build trip list item ──
  buildTripItem(trip) {
    const cfg = this.getStatusConfig(trip.status);
    const pct = trip.total_bins_planned > 0
      ? Math.round((trip.total_bins_collected / trip.total_bins_planned) * 100) : 0;
    const isSelected = this._selectedTrip?.id === trip.id;
    const startTime = trip.started_at ? UTILS.formatTime(trip.started_at) : '—';

    return `
    <div onclick="TripsView.selectTrip('${trip.id}')"
      class="trip-item px-4 py-3.5 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${isSelected ? 'bg-amber-50 border-l-2 border-l-amber-500' : ''}">

      <!-- Top row -->
      <div class="flex items-start justify-between mb-2">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            ${(trip.driver_name||'D').split(' ').map(n=>n[0]).join('').substring(0,2)}
          </div>
          <div>
            <div class="text-sm font-semibold text-gray-900">${trip.driver_name || '—'}</div>
            <div class="text-xs text-gray-400">${trip.circuit_name || 'ACC-001'}</div>
          </div>
        </div>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}">
          <span class="w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}"></span>
          ${cfg.label}
        </span>
      </div>

      <!-- Progress bar -->
      ${trip.status === 'in_progress' || trip.status === 'completed' ? `
      <div class="mb-2">
        <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
          <div class="h-full rounded-full transition-all ${trip.status === 'completed' ? 'bg-blue-400' : 'bg-green-500'}"
            style="width:${pct}%"></div>
        </div>
        <div class="flex justify-between text-xs text-gray-400">
          <span>${pct}% complete</span>
          <span>${trip.total_bins_collected}/${trip.total_bins_planned} stops</span>
        </div>
      </div>` : `
      <div class="text-xs text-gray-400 mb-2">${trip.total_bins_planned} stops planned</div>`}

      <!-- Bottom row -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1 text-xs text-gray-400">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Started ${startTime}
        </div>
        <div class="text-xs font-mono text-gray-400">${trip.id?.substring(0,8)}...</div>
      </div>
    </div>`;
  },

  // ── Render trips list ──
  renderList(trips) {
    const list = document.getElementById('trips-list');
    const count = document.getElementById('trips-count');
    if (!list) return;
    if (count) count.textContent = `${trips.length} trip${trips.length !== 1 ? 's' : ''}`;
    if (!trips.length) {
      list.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 text-center px-6">
          <div class="text-xs text-gray-400">No trips found for today</div>
        </div>`;
      return;
    }
    list.innerHTML = trips.map(t => this.buildTripItem(t)).join('');
  },

  // ── Filter by status ──
  _statusFilter: 'all',
  setStatusFilter(status, btn) {
    this._statusFilter = status;
    document.querySelectorAll('.trips-status-btn').forEach(b => {
      b.className = 'trips-status-btn flex-1 py-1.5 rounded-lg text-xs font-medium bg-white text-gray-500 border border-gray-200 transition-all';
    });
    if (btn) btn.className = 'trips-status-btn flex-1 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-black border border-amber-500 transition-all';
    const filtered = status === 'all'
      ? this._trips
      : this._trips.filter(t => t.status === status);
    this.renderList(filtered);
  },

  // ── Select a trip — show detail ──
  async selectTrip(tripId) {
    const trip = this._trips.find(t => t.id === tripId);
    if (!trip) return;
    this._selectedTrip = trip;

    // Highlight selected item
    document.querySelectorAll('.trip-item').forEach(el => {
      el.classList.remove('bg-amber-50', 'border-l-2', 'border-l-amber-500');
    });
    event?.currentTarget?.classList.add('bg-amber-50', 'border-l-2', 'border-l-amber-500');

    // Show loading in detail
    const detail = document.getElementById('trips-detail');
    detail.innerHTML = `
      <div class="flex items-center justify-center flex-1 py-16">
        <div class="flex items-center gap-3">
          <svg class="w-4 h-4 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span class="text-sm text-gray-500">Loading trip details...</span>
        </div>
      </div>`;

    try {
      const fullTrip = await API.getTrip(tripId);
      this.renderDetail(fullTrip);
    } catch (err) {
      console.error(err);
      detail.innerHTML = `<div class="text-sm text-red-500 p-8">Failed to load trip details.</div>`;
    }
  },

  // ── Render trip detail ──
  renderDetail(trip) {
    const detail = document.getElementById('trips-detail');
    if (!detail) return;

    const cfg = this.getStatusConfig(trip.status);
    const pct = trip.total_bins_planned > 0
      ? Math.round((trip.total_bins_collected / trip.total_bins_planned) * 100) : 0;
    const stops = trip.stops || [];

    // Bin positions for map
    const binPositions = {
      'BSL-001':{x:18,y:72},'BSL-002':{x:35,y:52},'BSL-003':{x:24,y:26},
      'BSL-004':{x:42,y:46},'BSL-005':{x:68,y:26},'BSL-006':{x:75,y:38},
      'BSL-007':{x:62,y:64},'BSL-008':{x:52,y:54},'BSL-009':{x:28,y:40},
      'BSL-010':{x:44,y:66},'BSL-011':{x:70,y:48},'BSL-012':{x:60,y:76},
      'BSL-013':{x:76,y:18},'BSL-014':{x:14,y:58},'BSL-015':{x:50,y:36},
      'BSL-016':{x:22,y:34},'BSL-017':{x:38,y:22},'BSL-018':{x:8,y:46},
      'BSL-019':{x:32,y:16},'BSL-020':{x:54,y:62},
    };

    // Build route line points
    const routePoints = stops
      .sort((a,b) => a.order - b.order)
      .map(s => binPositions[s.bin_serial])
      .filter(Boolean)
      .map(p => `${p.x * 7},${p.y * 5}`)
      .join(' ');

    // Stop markers for map
    const stopMarkers = stops.map(stop => {
      const pos = binPositions[stop.bin_serial];
      if (!pos) return '';
      const color = stop.status === 'collected' ? '#10B981'
        : stop.status === 'skipped' ? '#9CA3AF'
        : '#F59E0B';
      return `
        <div style="position:absolute;left:${pos.x}%;top:${pos.y}%;transform:translate(-50%,-50%);z-index:10">
          <div style="width:20px;height:20px;border-radius:50%;background:${color};border:3px solid #fff;
            box-shadow:0 2px 6px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;
            font-size:9px;font-weight:800;color:#fff;font-family:monospace">
            ${stop.order}
          </div>
        </div>`;
    }).join('');

    detail.innerHTML = `
    <div class="flex flex-col h-full overflow-hidden">

      <!-- Detail header -->
      <div class="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              ${(trip.driver_name||'D').split(' ').map(n=>n[0]).join('').substring(0,2)}
            </div>
            <div>
              <div class="font-semibold text-gray-900">${trip.driver_name}</div>
              <div class="text-xs text-gray-500">${trip.circuit_name} · ${UTILS.formatDate(trip.scheduled_date)}</div>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.badge}">
            <span class="w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}"></span>
            ${cfg.label}
          </span>
        </div>

        <!-- Progress -->
        ${trip.status !== 'pending' ? `
        <div class="mt-4">
          <div class="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div class="h-full rounded-full ${trip.status === 'completed' ? 'bg-blue-400' : 'bg-green-500'} transition-all"
              style="width:${pct}%"></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500">
            <span>${pct}% complete</span>
            <span>${trip.total_bins_collected} of ${trip.total_bins_planned} bins collected</span>
          </div>
        </div>` : ''}

        <!-- Timing row -->
        <div class="flex items-center gap-6 mt-3">
          <div class="flex items-center gap-1.5 text-xs text-gray-500">
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Started: <span class="font-medium text-gray-700 ml-1">${trip.started_at ? UTILS.formatTime(trip.started_at) : '—'}</span>
          </div>
          ${trip.completed_at ? `
          <div class="flex items-center gap-1.5 text-xs text-gray-500">
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Completed: <span class="font-medium text-gray-700 ml-1">${UTILS.formatTime(trip.completed_at)}</span>
          </div>` : ''}
          <div class="flex items-center gap-1.5 text-xs text-gray-500">
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5"/>
            </svg>
            <span class="font-medium text-gray-700">${trip.total_bins_planned}</span> stops planned
          </div>
        </div>
      </div>

      <!-- Map + Stops -->
      <div class="flex flex-1 overflow-hidden">

        <!-- Route map -->
        <div class="flex-1 relative overflow-hidden"
          style="background:#EEF0F3;background-image:linear-gradient(rgba(0,0,0,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.05) 1px,transparent 1px);background-size:40px 40px">

          <!-- Roads -->
          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 700 500" preserveAspectRatio="xMidYMid slice" fill="none">
            <path d="M0 250 Q175 238 350 250 Q525 262 700 250" stroke="#D1D5DB" stroke-width="14" stroke-linecap="round"/>
            <path d="M350 0 Q344 125 350 250 Q356 375 350 500" stroke="#D1D5DB" stroke-width="12" stroke-linecap="round"/>
            <path d="M0 125 Q220 118 440 125 Q570 129 700 122" stroke="#E5E7EB" stroke-width="7"/>
            <path d="M0 375 Q240 368 460 375 Q590 379 700 372" stroke="#E5E7EB" stroke-width="7"/>
            <path d="M175 0 Q169 250 175 500" stroke="#E5E7EB" stroke-width="6"/>
            <path d="M525 0 Q519 250 525 500" stroke="#E5E7EB" stroke-width="6"/>
            <!-- Route line -->
            ${routePoints ? `<polyline points="${routePoints}" stroke="#F59E0B" stroke-width="2.5" stroke-dasharray="6 4" fill="none" opacity="0.8"/>` : ''}
            <text x="60" y="88" fill="#CDD0D8" font-size="11" font-family="DM Sans" font-weight="600">EAST LEGON</text>
            <text x="460" y="88" fill="#CDD0D8" font-size="11" font-family="DM Sans" font-weight="600">AIRPORT</text>
            <text x="60" y="360" fill="#CDD0D8" font-size="11" font-family="DM Sans" font-weight="600">OKPONGLO</text>
            <text x="450" y="360" fill="#CDD0D8" font-size="11" font-family="DM Sans" font-weight="600">DZORWULU</text>
            <text x="250" y="242" fill="#CDD0D8" font-size="10" font-family="DM Sans" font-weight="600">ROMAN RIDGE</text>
          </svg>

          <!-- Stop markers -->
          ${stopMarkers}

          <!-- Map legend -->
          <div class="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-4">
            <div class="flex items-center gap-1.5 text-xs text-gray-500">
              <div class="w-3 h-3 rounded-full bg-green-500"></div>Collected
            </div>
            <div class="flex items-center gap-1.5 text-xs text-gray-500">
              <div class="w-3 h-3 rounded-full bg-amber-400"></div>Pending
            </div>
            <div class="flex items-center gap-1.5 text-xs text-gray-500">
              <div class="w-3 h-3 rounded-full bg-gray-400"></div>Skipped
            </div>
            <div class="flex items-center gap-4 text-xs text-gray-500 border-l border-gray-200 pl-4">
              <svg class="w-3 h-3 text-amber-500" fill="none" viewBox="0 0 24 24">
                <path d="M3 12h18" stroke="#F59E0B" stroke-width="2" stroke-dasharray="4 2"/>
              </svg>
              Route
            </div>
          </div>
        </div>

        <!-- Stops list -->
        <div class="w-64 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
          <div class="px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <div class="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Stop by Stop
            </div>
          </div>
          ${stops.length ? stops.sort((a,b) => a.order - b.order).map(stop => {
            const stopColor = stop.status === 'collected' ? 'text-green-600 bg-green-100'
              : stop.status === 'skipped' ? 'text-gray-400 bg-gray-100'
              : 'text-amber-600 bg-amber-100';
            const dotColor = stop.status === 'collected' ? 'bg-green-500'
              : stop.status === 'skipped' ? 'bg-gray-400'
              : 'bg-amber-400';
            const icon = stop.status === 'collected'
              ? `<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>`
              : stop.status === 'skipped'
              ? `<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>`
              : `<span class="text-xs font-bold">${stop.order}</span>`;
            return `
            <div class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${stopColor}">
                  ${icon}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-xs font-bold text-gray-700">${stop.bin_serial || '—'}</div>
                  <div class="text-xs text-gray-500 truncate">${stop.bin_location || '—'}</div>
                  ${stop.fill_level_at_dispatch != null
                    ? `<div class="text-xs text-gray-400 mt-0.5">Fill at dispatch: ${stop.fill_level_at_dispatch}%</div>`
                    : ''}
                </div>
                ${stop.collected_at ? `
                <div class="text-xs font-mono text-gray-400 flex-shrink-0">${UTILS.formatTime(stop.collected_at)}</div>` : ''}
              </div>
            </div>`;
          }).join('') : `
          <div class="flex items-center justify-center py-8 text-xs text-gray-400">
            No stops loaded
          </div>`}
        </div>
      </div>
    </div>`;
  },

  // ── Load trips ──
  async loadTrips() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data  = await API.getTrips({ date: today });
      this._trips = data.results || data;
      this.renderList(this._trips);

      // Auto-select first trip if exists
      if (this._trips.length > 0) {
        await this.selectTrip(this._trips[0].id);
      }
    } catch (err) {
      console.error('Trips load error:', err);
      const list = document.getElementById('trips-list');
      if (list) list.innerHTML = `<div class="text-sm text-red-500 p-6">Failed to load trips.</div>`;
    }
  },

  async mount(container) {
    this._trips = [];
    this._selectedTrip = null;
    this._statusFilter = 'all';
    container.innerHTML = this.template();
    await this.loadTrips();
  },

  unmount() {
    this._trips = [];
    this._selectedTrip = null;
  }
};