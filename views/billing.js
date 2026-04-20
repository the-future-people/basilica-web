// ─── BILLING VIEW ───────────────────────────────────────────────────
const BillingView = {
  template() {
    return `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="font-display text-2xl font-bold text-gray-900">Billing</h1>
        <p class="text-sm text-gray-500 mt-0.5">Subscriptions and payment management — coming soon</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <div class="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
          <svg class="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/>
          </svg>
        </div>
        <div class="font-semibold text-gray-900 mb-2">Billing & Subscriptions</div>
        <div class="text-sm text-gray-500 max-w-xs">Subscription management and Mobile Money payment tracking coming soon.</div>
      </div>
    </div>`;
  },
  async mount(container) { container.innerHTML = this.template(); },
  unmount() {}
};