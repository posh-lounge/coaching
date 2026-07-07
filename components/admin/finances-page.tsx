"use client";
import React, { useState } from "react";
import { DollarSign, Loader2, CheckCircle, TrendingUp } from "lucide-react";
import { useAdminFinances } from "@/lib/api/v1/hooks";
const fmt = (n: number) => `${Number(n || 0).toLocaleString()} RWF`;

// ─── FINANCES PAGE ────────────────────────────────────────────
function MiniBar({ data }: { data: any[] }) {
  if (!data?.length) return <div className="h-24 flex items-center justify-center text-gray-300 text-sm">No data</div>;
  const max = Math.max(...data.map(d => +d.platform)) || 1;
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => <div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-indigo-400 rounded-t-lg hover:bg-indigo-500 transition" style={{height:`${(+d.platform/max)*100}%`}} title={`${d.month}: ${fmt(d.platform)}`}/><span className="text-[8px] text-gray-400">{d.month?.slice(5)}</span></div>)}
    </div>
  );
}

export default function AdminFinancesPage() {
  const [period, setPeriod] = useState("30");
  const { data, isLoading } = useAdminFinances(period);
  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-indigo-400"/></div>;
  const t = data?.totals ?? {};
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-gray-900">Finances</h1><p className="text-gray-500 text-sm">Platform revenue and payouts</p></div>
          <div className="flex gap-2">{["7","30","60","90"].map(d=><button key={d} onClick={()=>setPeriod(d)} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${period===d?"bg-indigo-600 text-white":"bg-white border border-gray-200 text-gray-600"}`}>{d}d</button>)}</div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[{l:"Gross Revenue",v:fmt(t.gross??0),icon:<DollarSign size={20} className="text-indigo-500"/>,bg:"bg-indigo-50 border-indigo-200"},{l:"Platform Earnings",v:fmt(t.platform??0),icon:<TrendingUp size={20} className="text-emerald-500"/>,bg:"bg-emerald-50 border-emerald-200"},{l:"Pending Payouts",v:fmt(data?.pending_payouts?.total??0),icon:<DollarSign size={20} className="text-amber-500"/>,bg:"bg-amber-50 border-amber-200"},{l:"Total Paid Out",v:fmt(data?.paid_out?.total??0),icon:<CheckCircle size={20} className="text-gray-400"/>,bg:"bg-gray-50 border-gray-200"}].map(c=>(
            <div key={c.l} className={`rounded-2xl border-2 p-5 ${c.bg}`}><div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3">{c.icon}</div><p className="text-xl font-bold text-gray-900">{c.v}</p><p className="text-sm text-gray-500">{c.l}</p></div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"><h2 className="font-bold text-gray-900 mb-4">Monthly Platform Revenue</h2><MiniBar data={data?.monthly??[]}/></div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Top Earning Coaches</h2>
            {(data?.top_earners??[]).map((c:any,i:number)=>(
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm font-bold text-gray-200 w-5">#{i+1}</span>
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">{c.display_name?.[0]}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{c.display_name}</p><p className="text-xs text-gray-400">{c.packages} packages · {fmt(c.platform_fee)} to platform</p></div>
                <span className="text-sm font-bold text-emerald-600">{fmt(c.earned)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Recent Transactions</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-400 border-b border-gray-100"><th className="pb-2">Coach</th><th className="pb-2">Coachee</th><th className="pb-2">Sessions</th><th className="pb-2">Total</th><th className="pb-2">Platform</th><th className="pb-2">Method</th><th className="pb-2">Date</th></tr></thead>
            <tbody>{(data?.recent_tx??[]).map((tx:any)=>(
              <tr key={tx.package_id} className="border-b border-gray-50 last:border-0">
                <td className="py-2 font-medium text-gray-900 truncate max-w-[100px]">{tx.coach_name}</td>
                <td className="py-2 text-gray-500 truncate max-w-[100px]">{tx.coachee_name}</td>
                <td className="py-2">{tx.sessions_count}</td>
                <td className="py-2 font-semibold">{fmt(tx.amount_total)}</td>
                <td className="py-2 text-emerald-600 font-semibold">{fmt(tx.amount_system)}</td>
                <td className="py-2 text-gray-400 capitalize">{tx.payment_method}</td>
                <td className="py-2 text-gray-400 text-xs">{tx.paid_at?new Date(tx.paid_at).toLocaleDateString():"—"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}