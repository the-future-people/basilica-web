// ─── BINS VIEW ──────────────────────────────────────────────────────
const BinsView = {

  _allBins: [],
  _currentFilter: 'all',
  _searchQuery: '',

  template() {
    return `
    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="font-display text-2xl font-bold text-gray-900">All Bins</h1>
          <p class="text-sm text-gray-500 mt-0.5" id="bins-subtitle">Loading...</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <input id="bins-search" type="text" placeholder="Search by ID or location..."
              oninput="BinsView.handleSearch(this.value)"
              class="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 w-60 transition-all"/>
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
            </svg>
          </div>
          <button onclick="BinsView.loadBins()" class="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
            <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="flex flex-wrap items-center gap-2 mb-6">
        <button onclick="BinsView.setFilter('all',this)" class="bins-tab active-tab px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 text-black border border-amber-500">All <span id="tab-all" class="font-mono ml-1">—</span></button>
        <button onclick="BinsView.setFilter('critical',this)" class="bins-tab px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-500 border border-gray-200 hover:border-red-300 hover:text-red-600 transition-all">🔴 Critical <span id="tab-critical" class="font-mono ml-1">—</span></button>
        <button onclick="BinsView.setFilter('warning',this)"  class="bins-tab px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-500 border border-gray-200 hover:border-amber-300 hover:text-amber-600 transition-all">🟡 Warning <span id="tab-warning" class="font-mono ml-1">—</span></button>
        <button onclick="BinsView.setFilter('healthy',this)"  class="bins-tab px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-500 border border-gray-200 hover:border-green-300 hover:text-green-600 transition-all">🟢 Healthy <span id="tab-healthy" class="font-mono ml-1">—</span></button>
        <button onclick="BinsView.setFilter('offline',this)"  class="bins-tab px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-500 border border-gray-200 transition-all">⚫ Offline <span id="tab-offline" class="font-mono ml-1">—</span></button>
      </div>

      <!-- Grid -->
      <div id="bins-loading" class="flex items-center justify-center py-24">
        <div class="flex items-center gap-3 bg-white rounded-xl px-6 py-4 border border-gray-200 shadow-sm">
          <svg class="w-5 h-5 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span class="text-sm text-gray-600 font-medium">Loading bins...</span>
        </div>
      </div>
      <div id="bins-empty" class="hidden flex flex-col items-center justify-center py-24 text-center">
        <div class="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5"/>
          </svg>
        </div>
        <div class="text-sm font-semibold text-gray-900 mb-1">No bins found</div>
        <div class="text-xs text-gray-400">Try a different filter or search</div>
      </div>
      <div id="bins-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"></div>
    </div>`;
  },

  getStatus(bin) {
    if (!bin.is_online) return 'offline';
    const f = bin.fill_level ?? 0;
    if (f >= 80) return 'critical';
    if (f >= 60) return 'warning';
    return 'healthy';
  },

  getAccent(status) {
    return {
      critical: { border:'border-red-400',   bg:'bg-red-500',   text:'text-red-500',   light:'bg-red-50',   badge:'bg-red-100 text-red-600',   bar:'#EF4444' },
      warning:  { border:'border-amber-400', bg:'bg-amber-500', text:'text-amber-500', light:'bg-amber-50', badge:'bg-amber-100 text-amber-600', bar:'#F59E0B' },
      healthy:  { border:'border-green-400', bg:'bg-green-500', text:'text-green-600', light:'bg-green-50', badge:'bg-green-100 text-green-700', bar:'#10B981' },
      offline:  { border:'border-gray-300',  bg:'bg-gray-400',  text:'text-gray-400',  light:'bg-gray-50',  badge:'bg-gray-100 text-gray-500',  bar:'#D1D5DB' },
    }[status];
  },

  buildCard(bin) {
    const status = this.getStatus(bin);
    const a = this.getAccent(status);
    const fill = bin.fill_level ?? 0;
    const t = bin.latest_telemetry || {};
    const statusLabel = {critical:'Critical',warning:'Warning',healthy:'Healthy',offline:'Offline'}[status];
    const wasteColor = {general:'bg-red-500',recyclable:'bg-blue-500',organic:'bg-green-500'}[bin.bin_type]||'bg-gray-400';
    const blink = status === 'critical' ? 'animate-pulse' : '';

    return `
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
      <div class="flex">
        <div class="w-1 flex-shrink-0 ${a.bg} rounded-l-xl"></div>
        <div class="flex-1 p-3">

          <!-- Top -->
          <div class="flex items-start justify-between mb-2">
            <div>
              <div class="font-mono text-xs font-bold ${a.text} mb-0.5">${bin.serial_number}</div>
              <h3 class="font-semibold text-sm text-gray-900 leading-tight">${bin.location_description}</h3>
              <span class="inline-flex items-center gap-1 mt-1 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-mono">${bin.circuit_name||'ACC-001'}</span>
            </div>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${a.badge} flex-shrink-0 ml-2">
              <span class="w-1.5 h-1.5 rounded-full ${a.bg} ${blink}"></span>
              ${statusLabel}
            </span>
          </div>

          <!-- Waste type + Est time -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full ${wasteColor} flex-shrink-0"></span>
              <span class="text-xs text-gray-500 capitalize">${bin.bin_type} waste</span>
            </div>
            <div class="flex items-center gap-1 text-xs text-gray-400">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Est. full ~ <span class="font-medium text-gray-600 ml-0.5">—h —m</span>
            </div>
          </div>

          <!-- Fill level -->
          <div class="flex items-end justify-between mb-1.5">
            <div class="flex items-end gap-0.5">
              <span class="font-mono font-bold text-2xl leading-none ${a.text}">${bin.is_online ? fill : '—'}</span>
              ${bin.is_online ? `<span class="font-mono text-sm font-bold ${a.text} mb-0.5">%</span>` : ''}
            </div>
            <div class="flex items-center gap-1 text-xs text-gray-500">
              <svg class="w-3.5 h-3.5 ${t.battery_level < 20 ? 'text-red-500' : 'text-gray-400'}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z"/>
              </svg>
              <span class="font-mono font-medium ${t.battery_level < 20 ? 'text-red-500' : ''}">${t.battery_level != null ? t.battery_level+'%' : '—'}</span>
            </div>
          </div>

          <!-- Fill bar -->
          <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div class="h-full rounded-full transition-all duration-500" style="width:${bin.is_online?fill:0}%;background:${a.bar}"></div>
          </div>

          <!-- Sensor chips -->
          <div class="flex flex-wrap gap-1.5 mb-3">
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              Temp ${t.temperature ? parseFloat(t.temperature).toFixed(1)+'°C' : '—'}
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              Toxi —
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              Smoke —
            </span>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-2.5 border-t border-gray-100">
            <div class="flex items-center gap-1.5">
              <div class="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <svg class="w-2.5 h-2.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                </svg>
              </div>
              <span class="text-xs text-gray-500">Bearer <span class="font-medium text-gray-700">—</span></span>
            </div>
            <span class="text-xs font-semibold ${a.text}">${(bin.circuit_name||'ACC-001').replace('Ayawaso West Circuit 1','Ga West · ACC-001')}</span>
          </div>

          <!-- Hover actions -->
          <div class="flex gap-2 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button class="flex-1 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              View history
            </button>
            <button class="flex-1 py-1.5 rounded-lg text-xs font-medium ${a.light} ${a.text} hover:opacity-80 transition-opacity">
              Add to route
            </button>
          </div>
        </div>
      </div>
    </div>`;
  },

  getFiltered() {
    return this._allBins.filter(bin => {
      const s = this.getStatus(bin);
      const matchFilter = this._currentFilter === 'all' || s === this._currentFilter;
      const q = this._searchQuery.toLowerCase();
      const matchSearch = !q || bin.serial_number.toLowerCase().includes(q) || bin.location_description.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  },

  renderGrid(bins) {
    const loading = document.getElementById('bins-loading');
    const empty   = document.getElementById('bins-empty');
    const grid    = document.getElementById('bins-grid');
    if (!grid) return;
    if (loading) loading.classList.add('hidden');
    if (!bins.length) {
      if (empty) empty.classList.remove('hidden');
      grid.innerHTML = '';
      return;
    }
    if (empty) empty.classList.add('hidden');
    grid.innerHTML = bins.map(b => this.buildCard(b)).join('');
  },

  setFilter(filter, btn) {
    this._currentFilter = filter;
    document.querySelectorAll('.bins-tab').forEach(b => {
      b.className = 'bins-tab px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-500 border border-gray-200 transition-all';
    });
    if (btn) btn.className = 'bins-tab active-tab px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 text-black border border-amber-500';
    this.renderGrid(this.getFiltered());
    this.updateSubtitle();
  },

  handleSearch(val) {
    this._searchQuery = val;
    this.renderGrid(this.getFiltered());
    this.updateSubtitle();
  },

  updateSubtitle() {
    const el = document.getElementById('bins-subtitle');
    if (el) el.textContent = `${this.getFiltered().length} of ${this._allBins.length} bins · Circuit ACC-001`;
  },

  updateTabs(bins) {
    let critical=0,warning=0,healthy=0,offline=0;
    bins.forEach(b => {
      const s = this.getStatus(b);
      if (s==='critical') critical++;
      else if (s==='warning') warning++;
      else if (s==='healthy') healthy++;
      else offline++;
    });
    const set = (id,val) => { const el=document.getElementById(id); if(el) el.textContent=val; };
    set('tab-all', bins.length);
    set('tab-critical', critical);
    set('tab-warning', warning);
    set('tab-healthy', healthy);
    set('tab-offline', offline);
    set('sidebarBinCount', bins.length);
  },

  async loadBins() {
    const loading = document.getElementById('bins-loading');
    const grid    = document.getElementById('bins-grid');
    if (loading) loading.classList.remove('hidden');
    if (grid) grid.innerHTML = '';

    try {
      const data = await API.getBins();
      this._allBins = (data.results || data).sort((a,b) => (b.fill_level??0)-(a.fill_level??0));
      this.updateTabs(this._allBins);
      this.updateSubtitle();
      this.renderGrid(this.getFiltered());
    } catch (err) {
      console.error('Bins load error:', err);
      if (loading) loading.innerHTML = `<div class="text-sm text-red-500">Failed to load bins.</div>`;
    }
  },

  async mount(container) {
    // Reset state
    this._currentFilter = 'all';
    this._searchQuery = '';
    container.innerHTML = this.template();
    await this.loadBins();
  },

  unmount() {
    this._allBins = [];
    this._currentFilter = 'all';
    this._searchQuery = '';
  }
};