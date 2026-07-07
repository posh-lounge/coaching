"use client";
import React, { useState } from "react";
import { Users, DollarSign, TrendingUp, AlertCircle, CheckCircle, XCircle, Clock, Star, Shield, CreditCard, Loader2 } from "lucide-react";
import { useAdminDashboard, useAdminAction } from "@/lib/api/v1/hooks";

const fmt = (n: number) => `${Number(n || 0).toLocaleString()} RWF`;

export default function AdminDashboard() {
  const [period,  setPeriod]  = useState("30");
  const [tab,     setTab]     = useState<"overview" | "coaches" | "disputes" | "payouts">("overview");
  const { data, isLoading } = useAdminDashboard(period);
  const action = useAdminAction();
  const ov = data?.overview ?? {};

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-indigo-400"/>
    </div>
  );

  const kpis = [
    { l: "Active Coaches",    v: ov.active_coaches         ?? 0, icon: <Star size={18} className="text-indigo-500"/> },
    { l: "Total Coachees",    v: ov.total_coachees         ?? 0, icon: <Users size={18} className="text-violet-500"/> },
    { l: "Active Pairs",      v: ov.active_relationships   ?? 0, icon: <TrendingUp size={18} className="text-emerald-500"/> },
    { l: "Sessions Today",    v: ov.sessions_today         ?? 0, icon: <CheckCircle size={18} className="text-blue-500"/> },
    { l: "Revenue This Month",v: fmt(ov.revenue_this_month ?? 0), icon: <DollarSign size={18} className="text-emerald-500"/> },
    { l: "Total Revenue",     v: fmt(ov.total_platform_revenue ?? 0), icon: <DollarSign size={18} className="text-indigo-500"/> },
    { l: "Open Disputes",     v: ov.open_disputes          ?? 0, icon: <AlertCircle size={18} className="text-red-500"/>,  alert: (ov.open_disputes ?? 0) > 0 },
    { l: "Pending Payouts",   v: ov.pending_payouts        ?? 0, icon: <CreditCard size={18} className="text-amber-500"/>, alert: (ov.pending_payouts ?? 0) > 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3"><Shield size={24} className="text-indigo-600"/><div><h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1><p className="text-gray-500 text-sm">Platform management</p></div></div>
          <div className="flex gap-2">
            {["7","30","60","90"].map(d => <button key={d} onClick={() => setPeriod(d)} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${period === d ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-200"}`}>{d}d</button>)}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {kpis.map(k => (
            <div key={k.l} className={`bg-white rounded-2xl border-2 p-4 shadow-sm ${(k as any).alert && +k.v > 0 ? "border-red-200" : "border-gray-100"}`}>
              <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center mb-2">{k.icon}</div>
              <p className="text-xl font-bold text-gray-900">{k.v}</p>
              <p className="text-xs text-gray-400 mt-0.5">{k.l}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          {[{ v: "overview", l: "Overview" }, { v: "coaches", l: `Applications (${ov.pending_coach_applications ?? 0})` }, { v: "disputes", l: `Disputes (${ov.open_disputes ?? 0})` }, { v: "payouts", l: `Payouts (${ov.pending_payouts ?? 0})` }].map(t => (
            <button key={t.v} onClick={() => setTab(t.v as any)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === t.v ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-200"}`}>{t.l}</button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-4">
            {/* Top coaches */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Top Coaches by Revenue</h2>
              {(data?.top_coaches ?? []).slice(0, 8).map((c: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-lg font-bold text-gray-200 w-6">#{i+1}</span>
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0 overflow-hidden">
                    {c.profile_photo ? <img src={c.profile_photo} alt="" className="w-full h-full object-cover"/> : c.display_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{c.display_name}</p><p className="text-xs text-gray-400">⭐ {Number(c.rating_avg).toFixed(1)} · {c.sessions_total} sessions · {c.coachees} coachees</p></div>
                  <span className="text-sm font-bold text-emerald-600 shrink-0">{(Number(c.platform_rev) / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
            {/* Recent transactions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Recent Transactions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-left text-gray-400 border-b border-gray-100"><th className="pb-2">Coach</th><th className="pb-2">Coachee</th><th className="pb-2">Platform</th><th className="pb-2">Date</th></tr></thead>
                  <tbody>{(data?.recent_tx ?? []).map((t: any) => (
                    <tr key={t.package_id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 font-medium text-gray-900 truncate max-w-[100px]">{t.coach_name}</td>
                      <td className="py-2 text-gray-500 truncate max-w-[100px]">{t.coachee_name}</td>
                      <td className="py-2 text-emerald-600 font-semibold">{fmt(t.amount_system)}</td>
                      <td className="py-2 text-gray-400">{t.paid_at ? new Date(t.paid_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "coaches" && (
          <div className="space-y-4">
            {(data?.pending_coaches ?? []).length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><CheckCircle size={36} className="mx-auto mb-3 text-gray-200"/><p className="text-gray-500">No pending applications</p></div>
            ) : (data?.pending_coaches ?? []).map((c: any) => (
              <div key={c.coach_id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">{c.display_name?.[0]}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">{c.display_name}</h3>
                    <p className="text-sm text-gray-500">{c.email}</p>
                    {c.tagline && <p className="text-sm text-gray-600 mt-1 italic">"{c.tagline}"</p>}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {c.session_rate && <span className="text-sm font-semibold text-indigo-600">{fmt(c.session_rate)}/session</span>}
                      {c.years_experience && <span className="text-xs text-gray-400">{c.years_experience}yrs exp.</span>}
                      {c.tags && c.tags.split(",").map((t: string) => <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{t.trim()}</span>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => action.mutate({ action: "verify_coach", coach_id: c.coach_id })} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold hover:bg-blue-100 transition flex items-center gap-1"><Shield size={11}/>Verify</button>
                    <button onClick={() => action.mutate({ action: "feature_coach", coach_id: c.coach_id, featured: 1 })} className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold hover:bg-amber-100 transition flex items-center gap-1"><Star size={11}/>Feature</button>
                    <button onClick={() => action.mutate({ action: "approve_coach", coach_id: c.coach_id })} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"><CheckCircle size={14}/>Approve</button>
                    <button onClick={() => action.mutate({ action: "reject_coach", coach_id: c.coach_id, reason: "Not meeting platform requirements" })} className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition flex items-center gap-2"><XCircle size={14}/>Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "disputes" && (
          <div className="space-y-4">
            {(data?.open_disputes ?? []).length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><CheckCircle size={36} className="mx-auto mb-3 text-gray-200"/><p className="text-gray-500">No open disputes</p></div>
            : (data?.open_disputes ?? []).map((d: any) => (
              <div key={d.dispute_id} className="bg-white rounded-2xl border-2 border-red-100 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${d.status === "open" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>{d.status}</span><span className="text-xs text-gray-400 capitalize">{d.type}</span></div>
                    <h3 className="font-bold text-gray-900">{d.title}</h3>
                    <p className="text-sm text-gray-500">{d.firstname} {d.lastname} · {d.email}</p>
                    <p className="text-sm text-gray-600 mt-2">{d.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => action.mutate({ action: "resolve_dispute", dispute_id: d.dispute_id, resolution: "Resolved by admin review.", status: "resolved" })} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition">Resolve</button>
                    <button onClick={() => action.mutate({ action: "resolve_dispute", dispute_id: d.dispute_id, resolution: "Closed.", status: "closed" })} className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl text-sm font-semibold transition">Close</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "payouts" && (
          <div className="space-y-4">
            {(data?.pending_payouts ?? []).length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><CheckCircle size={36} className="mx-auto mb-3 text-gray-200"/><p className="text-gray-500">No pending payouts</p></div>
            : (data?.pending_payouts ?? []).map((p: any) => (
              <div key={p.payout_id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{p.coach_name}</h3>
                  <p className="text-xl font-bold text-emerald-600">{fmt(p.amount)}</p>
                  <p className="text-sm text-gray-500">via {p.method} · {p.account_info}</p>
                  <p className="text-xs text-gray-400">Requested {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => action.mutate({ action: "process_payout", payout_id: p.payout_id, status: "completed" })} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"><CheckCircle size={14}/>Pay Out</button>
                  <button onClick={() => action.mutate({ action: "process_payout", payout_id: p.payout_id, status: "rejected", note: "Rejected by admin." })} className="px-4 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
