"use client";
import React, { useState } from "react";
import { Search, Shield, Star, Sparkles, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAdminCoaches,  useAdminAction, useAdminCoachAction } from "@/lib/api/v1/hooks";

const fmt = (n: number) => `${Number(n || 0).toLocaleString()} RWF`;

// ─── COACHES PAGE ─────────────────────────────────────────────
export default function AdminCoachesPage() {
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("");
  const [detail, setDetail]   = useState<any>(null);
  const { data, isLoading } = useAdminCoaches(status ? { search, status } : { search });
  const action    = useAdminCoachAction();
  const adminAct  = useAdminAction();
  const coaches   = data?.coaches ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Coaches</h1><p className="text-gray-500 text-sm">{coaches.length} coaches</p></div>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-400 bg-white"/>
          </div>
          <div className="flex gap-2">
            {["","active","pending","suspended"].map(s => <button key={s} onClick={() => setStatus(s)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${status===s?"bg-indigo-600 text-white":"bg-white border border-gray-200 text-gray-600 hover:border-indigo-200"}`}>{s||"All"}</button>)}
          </div>
        </div>
        {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400"/></div>
        : (
          <div className="space-y-3">
            {coaches.map((c: any) => (
              <div key={c.coach_id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-indigo-200 transition">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0 overflow-hidden">
                    {c.profile_photo?<img src={c.profile_photo} alt="" className="w-full h-full object-cover"/>:c.display_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="font-bold text-gray-900">{c.display_name}</h3>
                      {c.is_verified?<Shield size={13} className="text-indigo-500"/>:null}
                      {c.is_featured?<Sparkles size={13} className="text-amber-500"/>:null}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${c.status==="active"?"bg-emerald-50 text-emerald-700":c.status==="pending"?"bg-amber-50 text-amber-700":"bg-red-50 text-red-600"}`}>{c.status}</span>
                    </div>
                    <p className="text-sm text-gray-500">{c.email}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      {c.rating_avg>0&&<span>⭐ {Number(c.rating_avg).toFixed(1)} ({c.rating_count})</span>}
                      <span>{c.sessions_total} sessions</span>
                      <span>{c.active_coachees} active coachees</span>
                      {c.platform_revenue>0&&<span className="text-emerald-600 font-semibold">{fmt(c.platform_revenue)} platform revenue</span>}
                      {c.session_rate&&<span>{fmt(c.session_rate)}/session</span>}
                    </div>
                    {c.tags&&<div className="flex flex-wrap gap-1.5 mt-2">{c.tags.split(",").filter(Boolean).slice(0,4).map((t:string)=><span key={t} className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">{t.trim()}</span>)}</div>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {c.status==="pending"&&<><button onClick={()=>adminAct.mutate({action:"approve_coach",coach_id:c.coach_id})} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1"><CheckCircle size={11}/>Approve</button><button onClick={()=>adminAct.mutate({action:"reject_coach",coach_id:c.coach_id,reason:"Not meeting platform requirements"})} className="px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs font-semibold transition flex items-center gap-1"><XCircle size={11}/>Reject</button></>}
                    {c.status==="active"&&<>
                      {!c.is_verified&&<button onClick={()=>adminAct.mutate({action:"verify_coach",coach_id:c.coach_id})} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold hover:bg-blue-100 transition flex items-center gap-1"><Shield size={11}/>Verify</button>}
                      <button onClick={()=>adminAct.mutate({action:"feature_coach",coach_id:c.coach_id,featured:c.is_featured?0:1})} className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold hover:bg-amber-100 transition"><Star size={11}/> {c.is_featured?"Unfeature":"Feature"}</button>
                      <button onClick={()=>action.mutate({action:"update_status",coach_id:c.coach_id,status:"suspended"})} className="px-3 py-1.5 border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-xl text-xs font-semibold transition">Suspend</button>
                    </>}
                    {c.status==="suspended"&&<button onClick={()=>action.mutate({action:"update_status",coach_id:c.coach_id,status:"active"})} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition">Reactivate</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}