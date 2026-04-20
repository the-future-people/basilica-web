// ─── OVERVIEW VIEW ──────────────────────────────────────────────────
const OverviewView = {

  _refreshInterval: null,
  _truckInterval: null,
  _allBins: [],
  _activeTrip: null,
  _truckPosition: null,

  template() {
    return `
    <div class="p-6">
      <div class="flex gap-5" style="height:calc(100vh - 180px)">

        <!-- Map section -->
        <div class="flex-1 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden">

          <!-- Map toolbar -->
          <div class="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 flex-shrink-0">
            <div>
              <div class="text-sm font-semibold text-gray-900">Circuit Map</div>
              <div class="text-xs text-gray-400" id="ov-mapSubtitle">Loading...</div>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5 text-xs font-medium text-green-600 mr-2">
                <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                Live telemetry
              </div>
              <button onclick="OverviewView.filterMap('all',this)" class="ov-filter px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-black border border-amber-500">All</button>
              <button onclick="OverviewView.filterMap('critical',this)" class="ov-filter px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-gray-500 border border-gray-200 hover:border-red-300 hover:text-red-600 transition-all">Critical</button>
              <button onclick="OverviewView.filterMap('offline',this)" class="ov-filter px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-gray-500 border border-gray-200 transition-all">Offline</button>
            </div>
          </div>

          <!-- Map -->
          <div class="flex-1 relative overflow-hidden" id="ov-map"
            style="background:#EEF0F3;background-image:linear-gradient(rgba(0,0,0,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.05) 1px,transparent 1px);background-size:40px 40px">
            <svg class="absolute inset-0 w-full h-full" viewBox="0 0 700 500" preserveAspectRatio="xMidYMid slice" fill="none">
              <path d="M0 250 Q175 238 350 250 Q525 262 700 250" stroke="#D1D5DB" stroke-width="14" stroke-linecap="round"/>
              <path d="M350 0 Q344 125 350 250 Q356 375 350 500" stroke="#D1D5DB" stroke-width="12" stroke-linecap="round"/>
              <path d="M0 125 Q220 118 440 125 Q570 129 700 122" stroke="#E5E7EB" stroke-width="7"/>
              <path d="M0 375 Q240 368 460 375 Q590 379 700 372" stroke="#E5E7EB" stroke-width="7"/>
              <path d="M175 0 Q169 250 175 500" stroke="#E5E7EB" stroke-width="6"/>
              <path d="M525 0 Q519 250 525 500" stroke="#E5E7EB" stroke-width="6"/>
              <text x="18" y="246" fill="#C4C9D4" font-size="10" font-family="DM Sans">Ring Road Central</text>
              <text x="358" y="22" fill="#C4C9D4" font-size="10" font-family="DM Sans">Dzorwulu Rd</text>
              <text x="182" y="22" fill="#C4C9D4" font-size="9" font-family="DM Sans">Legon Ave</text>
              <text x="358" y="128" fill="#C4C9D4" font-size="9" font-family="DM Sans">Airport Rd</text>
              <text x="358" y="378" fill="#C4C9D4" font-size="9" font-family="DM Sans">Okponglo Rd</text>
              <text x="60" y="88" fill="#CDD0D8" font-size="11" font-family="DM Sans" font-weight="600">EAST LEGON</text>
              <text x="460" y="88" fill="#CDD0D8" font-size="11" font-family="DM Sans" font-weight="600">AIRPORT</text>
              <text x="60" y="360" fill="#CDD0D8" font-size="11" font-family="DM Sans" font-weight="600">OKPONGLO</text>
              <text x="450" y="360" fill="#CDD0D8" font-size="11" font-family="DM Sans" font-weight="600">DZORWULU</text>
              <text x="250" y="242" fill="#CDD0D8" font-size="10" font-family="DM Sans" font-weight="600">ROMAN RIDGE</text>
            </svg>
            <div id="ov-markers"></div>
            <div id="ov-mapLoading" class="absolute inset-0 bg-gray-100 bg-opacity-70 flex items-center justify-center">
              <div class="flex items-center gap-3 bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-200">
                <svg class="w-4 h-4 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span class="text-sm text-gray-600 font-medium">Loading telemetry...</span>
              </div>
            </div>
          </div>

          <!-- Stats bar -->
          <div class="grid grid-cols-4 gap-3 px-4 py-3 border-t border-gray-200 flex-shrink-0 bg-white">
            <div class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-red-50 cursor-pointer transition-all" onclick="OverviewView.filterMap('critical',null)">
              <div class="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🔴</div>
              <div><div class="font-mono text-lg font-bold text-red-600" id="ov-critical">—</div><div class="text-xs text-gray-400">Critical</div></div>
            </div>
            <div class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-amber-50 cursor-pointer transition-all" onclick="OverviewView.filterMap('warning',null)">
              <div class="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🟡</div>
              <div><div class="font-mono text-lg font-bold text-amber-500" id="ov-warning">—</div><div class="text-xs text-gray-400">Warning</div></div>
            </div>
            <div class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-green-50 cursor-pointer transition-all" onclick="OverviewView.filterMap('ok',null)">
              <div class="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🟢</div>
              <div><div class="font-mono text-lg font-bold text-green-600" id="ov-healthy">—</div><div class="text-xs text-gray-400">Healthy</div></div>
            </div>
            <div class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
              <div class="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center text-sm flex-shrink-0">⚫</div>
              <div><div class="font-mono text-lg font-bold text-gray-400" id="ov-offline">—</div><div class="text-xs text-gray-400">Offline</div></div>
            </div>
          </div>
        </div>

        <!-- Right panel -->
        <div class="hidden xl:flex flex-col w-72 gap-4">
          <div class="bg-white border border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div class="text-sm font-semibold text-gray-900">Active Trip</div>
              <button onclick="ROUTER.go('trips')" class="text-xs text-amber-600 hover:underline font-medium">View all</button>
            </div>
            <div class="p-4" id="ov-tripPanel">
              <div class="text-xs text-gray-400 text-center py-4">Loading...</div>
            </div>
          </div>
          <div class="bg-white border border-gray-200 rounded-xl overflow-hidden flex-1 flex flex-col min-h-0">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <div class="text-sm font-semibold text-gray-900">Bins by fill level</div>
              <button onclick="ROUTER.go('bins')" class="text-xs text-amber-600 hover:underline font-medium">View all</button>
            </div>
            <div class="overflow-y-auto custom-scroll flex-1" id="ov-binList"></div>
          </div>
        </div>
      </div>
    </div>`;
  },

  binPositions: {
    'BSL-001':{x:18,y:72},'BSL-002':{x:35,y:52},'BSL-003':{x:24,y:26},
    'BSL-004':{x:42,y:46},'BSL-005':{x:68,y:26},'BSL-006':{x:75,y:38},
    'BSL-007':{x:62,y:64},'BSL-008':{x:52,y:54},'BSL-009':{x:28,y:40},
    'BSL-010':{x:44,y:66},'BSL-011':{x:70,y:48},'BSL-012':{x:60,y:76},
    'BSL-013':{x:76,y:18},'BSL-014':{x:14,y:58},'BSL-015':{x:50,y:36},
    'BSL-016':{x:22,y:34},'BSL-017':{x:38,y:22},'BSL-018':{x:8,y:46},
    'BSL-019':{x:32,y:16},'BSL-020':{x:54,y:62},
  },

  // ── Helpers ──
  getStatus(bin) {
    if (!bin.is_online) return 'offline';
    const f = bin.fill_level ?? 0;
    if (f >= 80) return 'critical';
    if (f >= 60) return 'warning';
    return 'ok';
  },

  getPinColor(status) {
    return {critical:'#EF4444',warning:'#F59E0B',ok:'#10B981',offline:'#9CA3AF'}[status];
  },

  // ── Map filter ──
  filterMap(filter, btn) {
    document.querySelectorAll('.ov-filter').forEach(b => {
      b.className = 'ov-filter px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-gray-500 border border-gray-200 transition-all';
    });
    if (btn) btn.className = 'ov-filter px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-black border border-amber-500';
    this.renderMarkers(this._allBins, filter);
  },

  // ── Bin markers ──
  renderMarkers(bins, filter = 'all') {
    const container = document.getElementById('ov-markers');
    if (!container) return;
    container.innerHTML = '';

    bins.forEach(bin => {
      const status = this.getStatus(bin);
      if (filter !== 'all' && status !== filter) return;
      const pos = this.binPositions[bin.serial_number];
      if (!pos) return;
      const color = this.getPinColor(status);
      const fill  = bin.fill_level ?? 0;

      const m = document.createElement('div');
      m.style.cssText = `position:absolute;left:${pos.x}%;top:${pos.y}%;transform:translate(-50%,-50%);cursor:pointer;z-index:10`;
      m.innerHTML = `
        <div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.2);transition:transform 0.15s"
          onmouseover="this.style.transform='scale(1.5)'" onmouseout="this.style.transform='scale(1)'"></div>
        <div style="display:none;position:absolute;bottom:20px;left:50%;transform:translateX(-50%);background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;min-width:150px;box-shadow:0 4px 12px rgba(0,0,0,0.1);z-index:20;white-space:nowrap" class="bin-tip">
          <div style="font-family:monospace;font-size:10px;color:#9CA3AF;margin-bottom:4px">${bin.serial_number}</div>
          <div style="font-size:20px;font-weight:700;font-family:monospace;color:${color};line-height:1;margin-bottom:3px">${bin.is_online ? fill+'%' : 'Offline'}</div>
          <div style="font-size:11px;color:#6B7280">${bin.location_description}</div>
        </div>`;
      m.querySelector('div').addEventListener('mouseover', () => m.querySelector('.bin-tip').style.display = 'block');
      m.querySelector('div').addEventListener('mouseout',  () => m.querySelector('.bin-tip').style.display = 'none');
      m.onclick = () => ROUTER.go('bins');
      container.appendChild(m);
    });

    // Re-render truck on top after markers
    if (this._activeTrip && this._truckPosition) {
      this.renderTruck(container, this._truckPosition);
    }
  },

  // ── Stats bar ──
  renderStats(bins) {
    let critical=0, warning=0, ok=0, offline=0;
    bins.forEach(b => {
      const s = this.getStatus(b);
      if (s==='critical') critical++;
      else if (s==='warning') warning++;
      else if (s==='ok') ok++;
      else offline++;
    });
    const set = (id,val) => { const el=document.getElementById(id); if(el) el.textContent=val; };
    set('ov-critical', critical);
    set('ov-warning',  warning);
    set('ov-healthy',  ok);
    set('ov-offline',  offline);
    set('sidebarBinCount', bins.length);

    if (critical > 0 && !document.getElementById('ov-alertBanner')) {
      const banner = document.createElement('div');
      banner.id = 'ov-alertBanner';
      banner.className = 'bg-red-50 border-b border-red-200 px-5 py-2.5 flex items-center gap-3';
      banner.innerHTML = `
        <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
        </svg>
        <span class="text-sm text-red-700">${critical} bin${critical>1?'s':''} above 80% fill — needs urgent collection.</span>
        <button onclick="ROUTER.go('bins')" class="text-sm font-semibold text-red-700 underline ml-1">View bins →</button>`;
      document.getElementById('view-container').prepend(banner);
    }
  },

  // ── Bin list (right panel) ──
  renderBinList(bins) {
    const list = document.getElementById('ov-binList');
    if (!list) return;
    const colors  = {critical:'#EF4444',warning:'#F59E0B',ok:'#10B981',offline:'#9CA3AF'};
    const textCls = {critical:'text-red-600',warning:'text-amber-500',ok:'text-green-600',offline:'text-gray-400'};
    const sorted  = [...bins].sort((a,b) => (b.fill_level??0)-(a.fill_level??0));
    list.innerHTML = sorted.map(bin => {
      const s    = this.getStatus(bin);
      const fill = bin.fill_level ?? 0;
      return `
        <div class="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors" onclick="ROUTER.go('bins')">
          <div class="w-2 h-2 rounded-full flex-shrink-0" style="background:${colors[s]}"></div>
          <div class="font-mono text-xs text-gray-400 w-14 flex-shrink-0">${bin.serial_number}</div>
          <div class="text-xs text-gray-700 flex-1 truncate">${bin.location_description}</div>
          <div class="w-12 flex-shrink-0 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div style="height:100%;width:${bin.is_online?fill:0}%;background:${colors[s]};border-radius:3px"></div>
          </div>
          <div class="text-xs font-mono w-7 text-right flex-shrink-0 ${textCls[s]}">${bin.is_online?fill+'%':'—'}</div>
        </div>`;
    }).join('');
  },

  // ── Active trip panel ──
  renderTrip(trips) {
    const panel = document.getElementById('ov-tripPanel');
    if (!panel) return;
    const active = (trips.results || trips).find(t => t.status === 'in_progress');
    if (!active) {
      panel.innerHTML = `<div class="text-xs text-gray-400 text-center py-4">No active trip right now</div>`;
      return;
    }
    const pct      = active.total_bins_planned > 0 ? Math.round((active.total_bins_collected / active.total_bins_planned) * 100) : 0;
    const initials = (active.driver_name||'D').split(' ').map(n=>n[0]).join('').substring(0,2);

    const card  = document.getElementById('sidebarDriverCard');
    const dName = document.getElementById('sidebarDriverName');
    const dInfo = document.getElementById('sidebarDriverInfo');
    if (card)  card.classList.remove('hidden');
    if (dName) dName.textContent = active.driver_name;
    if (dInfo) dInfo.textContent = `Stop ${active.total_bins_collected} of ${active.total_bins_planned}`;
    const liveTag = document.getElementById('sidebarActiveTrip');
    if (liveTag) liveTag.classList.remove('hidden');

    panel.innerHTML = `
      <div class="bg-green-50 border border-green-200 rounded-xl p-3">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">${initials}</div>
          <div>
            <div class="text-xs font-semibold text-gray-900">${active.driver_name}</div>
            <div class="text-xs text-green-600 flex items-center gap-1">
              <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              On trip · ${active.circuit_name}
            </div>
          </div>
        </div>
        <div class="h-1.5 bg-green-100 rounded-full overflow-hidden mb-2">
          <div class="h-full bg-green-500 rounded-full" style="width:${pct}%"></div>
        </div>
        <div class="flex justify-between text-xs text-gray-500 mb-3">
          <span>${pct}% complete</span>
          <span>${active.total_bins_collected} of ${active.total_bins_planned}</span>
        </div>
        <div class="grid grid-cols-3 gap-1.5">
          <div class="bg-white rounded-lg p-2 text-center">
            <div class="font-mono text-base font-bold text-green-600">${active.total_bins_collected}</div>
            <div class="text-gray-400 uppercase tracking-wide" style="font-size:9px">Done</div>
          </div>
          <div class="bg-white rounded-lg p-2 text-center">
            <div class="font-mono text-base font-bold text-amber-500">${active.total_bins_planned - active.total_bins_collected}</div>
            <div class="text-gray-400 uppercase tracking-wide" style="font-size:9px">Left</div>
          </div>
          <div class="bg-white rounded-lg p-2 text-center">
            <div class="font-mono text-base font-bold text-gray-700">${active.total_bins_planned}</div>
            <div class="text-gray-400 uppercase tracking-wide" style="font-size:9px">Total</div>
          </div>
        </div>
      </div>`;
  },

  // ── Truck: get current stop ──
  getCurrentStopPosition(trip) {
    if (!trip || !trip.stops) return null;
    const collected = trip.stops
      .filter(s => s.status === 'collected')
      .sort((a, b) => b.order - a.order);
    const current = collected[0] || trip.stops.sort((a,b) => a.order - b.order)[0];
    if (!current) return null;
    return { stop: current, pos: this.binPositions[current.bin_serial] };
  },

renderTruck(container, stopData) {
    const existing = document.getElementById('ov-truck');
    if (existing) existing.remove();
    if (!stopData?.pos) return;

    const { stop, pos } = stopData;

    const truck = document.createElement('div');
    truck.id = 'ov-truck';
    truck.className = 'truck-marker';
    truck.style.cssText = `
      position: absolute;
      left: ${pos.x}%;
      top: ${pos.y}%;
      transform: translate(-50%, -50%);
      z-index: 30;
      cursor: pointer;
    `;

    truck.innerHTML = `
      <div style="position:relative" title="Kofi Mensah · Stop ${stop.order}">
        <!-- Top-down truck SVG like Bolt/Uber -->
        <svg width="36" height="52" viewBox="0 0 36 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Shadow -->
          <ellipse cx="18" cy="46" rx="10" ry="4" fill="rgba(0,0,0,0.15)"/>
          <!-- Truck body -->
          <rect x="6" y="8" width="24" height="36" rx="6" fill="#1F2937"/>
          <!-- Cab roof highlight -->
          <rect x="9" y="10" width="18" height="10" rx="3" fill="#374151"/>
          <!-- Windshield -->
          <rect x="10" y="11" width="16" height="7" rx="2" fill="#93C5FD" opacity="0.8"/>
          <!-- Left side window -->
          <rect x="7" y="22" width="4" height="6" rx="1" fill="#6B7280" opacity="0.6"/>
          <!-- Right side window -->
          <rect x="25" y="22" width="4" height="6" rx="1" fill="#6B7280" opacity="0.6"/>
          <!-- Cargo area lines -->
          <rect x="9" y="30" width="18" height="1.5" rx="1" fill="#374151"/>
          <rect x="9" y="34" width="18" height="1.5" rx="1" fill="#374151"/>
          <!-- Amber accent stripe on top -->
          <rect x="6" y="8" width="24" height="3" rx="2" fill="#F59E0B"/>
          <!-- Front lights -->
          <rect x="8" y="8" width="5" height="2" rx="1" fill="#FCD34D"/>
          <rect x="23" y="8" width="5" height="2" rx="1" fill="#FCD34D"/>
          <!-- Rear lights -->
          <rect x="8" y="42" width="5" height="2" rx="1" fill="#EF4444"/>
          <rect x="23" y="42" width="5" height="2" rx="1" fill="#EF4444"/>
          <!-- Left wheel -->
          <rect x="3" y="14" width="4" height="7" rx="2" fill="#111827"/>
          <rect x="3" y="28" width="4" height="7" rx="2" fill="#111827"/>
          <!-- Right wheel -->
          <rect x="29" y="14" width="4" height="7" rx="2" fill="#111827"/>
          <rect x="29" y="28" width="4" height="7" rx="2" fill="#111827"/>
          <!-- Live green dot -->
          <circle cx="18" cy="22" r="4" fill="#10B981"/>
          <circle cx="18" cy="22" r="2.5" fill="#fff"/>
        </svg>
        <!-- Stop label underneath -->
        <div style="
          position:absolute;
          bottom:-18px;
          left:50%;
          transform:translateX(-50%);
          background:#111827;
          color:#fff;
          font-size:9px;
          font-weight:700;
          font-family:'DM Sans',sans-serif;
          padding:2px 6px;
          border-radius:4px;
          white-space:nowrap;
          letter-spacing:0.04em;
        ">Stop ${stop.order}</div>
      </div>`;

    container.appendChild(truck);
    this._truckPosition = { stop, pos };
  },

  // ── Truck: move smoothly ──
  moveTruck(stopData) {
    if (!stopData?.pos) return;
    const { stop, pos } = stopData;
    const driverName = this._activeTrip?.driver_name?.split(' ')[0] || 'Driver';

    let truck = document.getElementById('ov-truck');
    if (!truck) {
      const container = document.getElementById('ov-markers');
      if (container) this.renderTruck(container, stopData);
      return;
    }

    // Only move if stop changed
    if (this._truckPosition?.stop?.order === stop.order) return;

    // Smooth CSS transition move
    truck.style.left = pos.x + '%';
    truck.style.top  = pos.y + '%';

    // Update label
    const label = truck.querySelector('div > div');
    if (label) label.textContent = `Stop ${stop.order}`;

    this._truckPosition = { stop, pos };

    // Restart bob animation
    truck.style.animation = 'none';
    setTimeout(() => { truck.style.animation = 'truckBob 2s ease-in-out infinite'; }, 2100);
  },

  // ── Truck: poll every 15s ──
  startTruckPolling() {
    if (this._truckInterval) clearInterval(this._truckInterval);
    this._truckInterval = setInterval(async () => {
      if (!this._activeTrip) return;
      try {
        const updated = await API.getTrip(this._activeTrip.id);
        this._activeTrip = updated;
        const stopData = this.getCurrentStopPosition(updated);
        if (stopData) {
          this.moveTruck(stopData);
          const dInfo = document.getElementById('sidebarDriverInfo');
          if (dInfo) dInfo.textContent = `Stop ${updated.total_bins_collected} of ${updated.total_bins_planned}`;
        }
        if (updated.status === 'completed') {
          const truck = document.getElementById('ov-truck');
          if (truck) {
            truck.style.opacity = '0';
            truck.style.transition = 'opacity 0.5s ease';
            setTimeout(() => truck.remove(), 500);
          }
          clearInterval(this._truckInterval);
        }
      } catch (err) {
        console.error('Truck poll error:', err);
      }
    }, 15000);
  },

  // ── Load all data ──
  async loadData() {
    try {
      const [binsData, tripsData, circuits] = await Promise.all([
        API.getBins(),
        API.getTrips({ status: 'in_progress' }),
        API.getCircuits()
      ]);

      this._allBins = binsData.results || binsData;

      const circuit = circuits.results?.[0] || circuits[0];
      if (circuit) {
        const sub = document.getElementById('ov-mapSubtitle');
        if (sub) sub.textContent = `${circuit.total_bins} bins · ${circuit.name.replace('Ayawaso West Circuit 1','Ayawaso West')}`;
      }

      this.renderMarkers(this._allBins, 'all');
      this.renderStats(this._allBins);
      this.renderBinList(this._allBins);

      // Load active trip with full stops
      const activeTrips = tripsData.results || tripsData;
      const activeTrip  = activeTrips.find(t => t.status === 'in_progress');

      if (activeTrip) {
        try { this._activeTrip = await API.getTrip(activeTrip.id); }
        catch(e) { this._activeTrip = activeTrip; }
      } else {
        this._activeTrip = null;
      }

      this.renderTrip(activeTrips);

      // Place truck on map
      if (this._activeTrip) {
        const stopData  = this.getCurrentStopPosition(this._activeTrip);
        const container = document.getElementById('ov-markers');
        if (container && stopData) {
          this.renderTruck(container, stopData);
        }
        this.startTruckPolling();
      }

      const loading = document.getElementById('ov-mapLoading');
      if (loading) loading.style.display = 'none';

    } catch (err) {
      console.error('Overview load error:', err);
    }
  },

  // ── Lifecycle ──
  async mount(container) {
    container.innerHTML = this.template();
    await this.loadData();
    this._refreshInterval = setInterval(() => this.loadData(), 60000);
  },

  unmount() {
    if (this._refreshInterval) { clearInterval(this._refreshInterval); this._refreshInterval = null; }
    if (this._truckInterval)   { clearInterval(this._truckInterval);   this._truckInterval   = null; }
    this._activeTrip    = null;
    this._truckPosition = null;
    const banner = document.getElementById('ov-alertBanner');
    if (banner) banner.remove();
  }
};