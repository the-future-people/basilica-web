// ─── TRIPS VIEW ─────────────────────────────────────────────────────
const TripsView = {
  template() {
    return `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="font-display text-2xl font-bold text-gray-900">Trips</h1>
        <p class="text-sm text-gray-500 mt-0.5">Collection trip management — coming soon</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <div class="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
          <svg class="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25"/>
          </svg>
        </div>
        <div class="font-semibold text-gray-900 mb-2">Trip Management</div>
        <div class="text-sm text-gray-500 max-w-xs">Full trip management view coming in the next build sprint.</div>
      </div>
    </div>`;
  },
  async mount(container) { container.innerHTML = this.template(); },
  unmount() {}
};