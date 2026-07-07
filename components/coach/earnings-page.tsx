"use client";
import React, { useState } from "react";
import { DollarSign, TrendingUp, Clock, CheckCircle, Loader2, CreditCard, X } from "lucide-react";
import { useCoachEarnings, useRequestPayout } from "@/lib/api/v1/hooks";

const fmt = (n: number) => `${Number(n || 0).toLocaleString()} RWF`;

function MiniBar({ data }: { data: any[] }) {
  if (!data?.length) return <div className="h-24 flex items-center justify-center text-gray-300 text-sm">No revenue data yet</div>;
  const max = Math.max(...data.map(d => +d.earned)) || 1;
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-indigo-500 hover:bg-indigo-400 rounded-t-lg transition cursor-default" style={{ height: `${(+d.earned / max) * 100}%` }} title={`${d.month}: ${fmt(d.earned)}`}/>
          <span className="text-[9px] text-gray-400">{d.month?.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

function PayoutModal({ available, onClose }: { available: number; onClose: () => void }) {
  const payout = useRequestPayout();
  const [amount, setAmount]   = useState(available);
  const [method, setMethod]   = useState<"momo" | "bank_transfer" | "cash">("momo");
  const [account, setAccount] = useState("");
  const [success, setSuccess] = useState(false);

  const handle = async () => {
    await payout.mutateAsync({ amount, method, account_info: account });
    setSuccess(true);
  };

  if (success) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-emerald-500"/></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payout Requested!</h2>
        <p className="text-gray-500 text-sm mb-6">{fmt(amount)} will be processed within 2–3 business days.</p>
        <button onClick={onClose} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold transition">Done</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
          <h2 className="text-white font-bold text-xl">Request Payout</h2>
          <p className="text-emerald-100 text-sm">Available: {fmt(available)}</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Amount (RWF)</label>
            <input type="number" value={amount} onChange={e => setAmount(+e.target.value)} max={available} min={1000} className="w-full border-2 border-gray-200 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm outline-none"/>
            <p className="text-xs text-gray-400 mt-1">Min 1,000 RWF · Max {fmt(available)}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {[{ v: "momo", l: "📱 MoMo" }, { v: "bank_transfer", l: "🏦 Bank" }, { v: "cash", l: "💵 Cash" }].map(m => (
                <button key={m.v} onClick={() => setMethod(m.v as any)} className={`py-2.5 rounded-xl text-sm font-medium border-2 transition ${method === m.v ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-emerald-200"}`}>{m.l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">{method === "momo" ? "Phone Number" : method === "bank_transfer" ? "Account Number" : "Contact Info"}</label>
            <input value={account} onChange={e => setAccount(e.target.value)} className="w-full border-2 border-gray-200 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder={method === "momo" ? "07X XXX XXXX" : method === "bank_transfer" ? "Account number" : "How to reach you"}/>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handle} disabled={payout.isPending || amount < 1000 || amount > available || !account} className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
            {payout.isPending && <Loader2 size={14} className="animate-spin"/>}Request
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoachEarningsPage() {
  const { data, isLoading } = useCoachEarnings();
  const [showPayout, setShowPayout] = useState(false);

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-indigo-400"/></div>;

  const s   = data?.summary ?? {};
  const avail   = Number(s.available ?? 0);
  const pending = Number(s.pending   ?? 0);
  const total   = Number(s.total     ?? 0);
  const paidOut = Number(s.paid_out  ?? 0);
  const monthly = data?.monthly     ?? [];
  const packages= data?.packages    ?? [];
  const payouts = data?.payouts     ?? [];
  const perCoachee = data?.per_coachee ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-bold text-gray-900">Earnings</h1><p className="text-gray-500 text-sm mt-0.5">Your coaching income overview</p></div>
          {avail > 0 && <button onClick={() => setShowPayout(true)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition"><CreditCard size={16}/>Request Payout</button>}
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Available", value: fmt(avail),   icon: <DollarSign size={20} className="text-emerald-500"/>, bg: "bg-emerald-50 border-emerald-200", v: "text-emerald-700" },
            { label: "Pending",   value: fmt(pending),  icon: <Clock size={20} className="text-amber-500"/>,        bg: "bg-amber-50 border-amber-200",     v: "text-amber-700" },
            { label: "Total Earned",value: fmt(total),   icon: <TrendingUp size={20} className="text-indigo-500"/>,  bg: "bg-indigo-50 border-indigo-200",   v: "text-indigo-700" },
            { label: "Paid Out",  value: fmt(paidOut),  icon: <CheckCircle size={20} className="text-gray-400"/>,   bg: "bg-gray-50 border-gray-200",       v: "text-gray-700" },
          ].map(c => (
            <div key={c.label} className={`rounded-2xl border-2 p-5 ${c.bg}`}>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3">{c.icon}</div>
              <p className={`text-xl font-bold ${c.v}`}>{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Monthly Revenue (12 months)</h2>
            <MiniBar data={monthly}/>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">By Coachee</h2>
            {perCoachee.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No data</p> : perCoachee.slice(0, 5).map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 overflow-hidden">
                  {c.profile_photo ? <img src={c.profile_photo} alt="" className="w-full h-full object-cover"/> : c.display_name?.[0]}
                </div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{c.display_name}</p><p className="text-xs text-gray-400">{c.sessions} sessions</p></div>
                <span className="text-sm font-bold text-emerald-600 shrink-0">{(Number(c.earned) / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-4">
          <h2 className="font-bold text-gray-900 mb-4">Recent Payments</h2>
          {packages.length === 0 ? <p className="text-gray-400 text-sm">No payments yet</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2">Coachee</th><th className="pb-2">Sessions</th><th className="pb-2">You Earn</th><th className="pb-2">Platform Fee</th><th className="pb-2">Method</th><th className="pb-2">Date</th>
                </tr></thead>
                <tbody>{packages.map((p: any) => (
                  <tr key={p.package_id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 font-medium text-gray-900">{p.coachee_name}</td>
                    <td className="py-3 text-gray-600">{p.sessions_count}</td>
                    <td className="py-3 font-semibold text-emerald-600">{fmt(p.amount_coach)}</td>
                    <td className="py-3 text-gray-400">{fmt(p.amount_system)}</td>
                    <td className="py-3 text-gray-500 capitalize">{p.payment_method}</td>
                    <td className="py-3 text-gray-400">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>

        {payouts.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Payout History</h2>
            {payouts.map((p: any) => (
              <div key={p.payout_id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div><p className="text-sm font-medium text-gray-900">{fmt(p.amount)} via {p.method}</p><p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}{p.admin_note ? ` · ${p.admin_note}` : ""}</p></div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${p.status === "completed" ? "bg-emerald-50 text-emerald-700" : p.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"}`}>{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {showPayout && <PayoutModal available={avail} onClose={() => setShowPayout(false)}/>}
    </div>
  );
}
