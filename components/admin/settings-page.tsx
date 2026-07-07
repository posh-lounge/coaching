
// ─── ADMIN SETTINGS PAGE ──────────────────────────────────────
export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1></div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
          {[{l:"Platform Fee Percentage",v:"30%",sub:"Applied to all coach purchases"},{l:"Minimum Sessions to Connect",v:"5 sessions",sub:"Coachees must buy at least 5 sessions"},{l:"Payout Processing Time",v:"2-3 business days",sub:"After coach requests payout"},{l:"Coach Application Review",v:"Manual",sub:"Applications reviewed by admin team"}].map(s=>(
            <div key={s.l} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div><p className="text-sm font-medium text-gray-900">{s.l}</p><p className="text-xs text-gray-400">{s.sub}</p></div>
              <span className="text-sm font-bold text-indigo-600">{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
