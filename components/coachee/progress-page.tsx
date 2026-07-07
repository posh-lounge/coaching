"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FolderOpen, BookOpen, File, FileText, Video, Music, Link as LinkIcon, Download, Loader2, Star, Calendar, MessageCircle, BarChart2, Bell, CheckCheck, Target, CheckSquare } from "lucide-react";
import { useCoacheeResources, useCoachResourceAction, useCoacheeNotifications, useMarkCoacheeNotifsRead, useCoacheeRelationships, useCoacheeProgress, useUpdateCoacheeProfile, useCoacheeProfile } from "@/lib/api/v1/hooks";


const TYPE_ICONS: Record<string, React.ReactNode> = { document:<FileText size={18} className="text-blue-500"/>, video:<Video size={18} className="text-red-500"/>, link:<LinkIcon size={18} className="text-indigo-500"/>, template:<File size={18} className="text-amber-500"/>, worksheet:<FileText size={18} className="text-emerald-500"/>, audio:<Music size={18} className="text-violet-500"/>, book:<BookOpen size={18} className="text-orange-500"/>, podcast:<Music size={18} className="text-pink-500"/> };


// ─── PROGRESS PAGE ────────────────────────────────────────────
export default function CoacheeProgressPage() {
  const { data: relsData } = useCoacheeRelationships();
  const [relId, setRelId] = useState<number | null>(null);
  const { data, isLoading } = useCoacheeProgress(relId);
  const rels = relsData?.relationships ?? [];

  const r = data;
  const sessionsDone  = r?.session_stats?.find((s: any) => s.status==="completed")?.cnt ?? 0;
  const tasksDone     = r?.task_stats?.filter((t: any) => t.status==="reviewed").reduce((a:number,t:any)=>a+(+t.cnt),0)??0;
  const goalsActive   = r?.goals?.filter((g: any) => g.status==="active").length ?? 0;
  const goalsAchieved = r?.goals?.filter((g: any) => g.status==="achieved").length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">My Progress</h1><p className="text-gray-500 text-sm mt-0.5">Track your coaching journey</p></div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Select Coach</label>
          <select value={relId??""} onChange={e=>setRelId(e.target.value?+e.target.value:null)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
            <option value="">Choose a coaching relationship...</option>
            {rels.map(r=><option key={r.rel_id} value={r.rel_id}>{r.coach_name} — {r.sessions_used} sessions done</option>)}
          </select>
        </div>
        {!relId ? <div className="text-center py-20 bg-white rounded-2xl border border-gray-100"><BarChart2 size={40} className="mx-auto mb-3 text-gray-200"/><p className="text-gray-500">Select a coaching relationship above</p></div>
          : isLoading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400"/></div>
          : r && (
            <div className="space-y-5">
              <div className="grid grid-cols-4 gap-3">
                {[{l:"Sessions Done",v:sessionsDone,c:"text-indigo-600"},{l:"Tasks Done",v:tasksDone,c:"text-violet-600"},{l:"Goals Active",v:goalsActive,c:"text-amber-600"},{l:"Goals Achieved",v:goalsAchieved,c:"text-emerald-600"}].map(s=>(
                  <div key={s.l} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm"><p className={`text-2xl font-bold ${s.c}`}>{s.v}</p><p className="text-xs text-gray-400 mt-0.5">{s.l}</p></div>
                ))}
              </div>
              {r.goals?.length>0&&(
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Goals</h3>
                  {r.goals.map((g:any)=>(
                    <div key={g.goal_id} className="flex items-center gap-4 mb-3 last:mb-0">
                      <div className="flex-1"><p className="text-sm font-medium text-gray-900 mb-1">{g.title}<span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full capitalize ${g.status==="achieved"?"bg-emerald-50 text-emerald-700":"bg-blue-50 text-blue-700"}`}>{g.status}</span></p><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{width:`${g.progress_pct}%`}}/></div></div>
                      <span className="text-sm font-bold text-gray-700 shrink-0">{g.progress_pct}%</span>
                    </div>
                  ))}
                </div>
              )}
              {r.avg_rating>0&&(
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">Your Session Ratings</h3>
                  <div className="flex items-center gap-3"><p className="text-3xl font-bold">{Number(r.avg_rating).toFixed(1)}</p><div><div className="flex gap-0.5">{[1,2,3,4,5].map(i=><span key={i} className={i<=Math.round(r.avg_rating)?"text-amber-400":"text-gray-200"}>★</span>)}</div><p className="text-xs text-gray-400">{r.reviews?.length} reviews given</p></div></div>
                </div>
              )}
              {r.recent_sessions?.length>0&&(
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">Recent Sessions</h3>
                  {r.recent_sessions.map((s:any)=>(
                    <div key={s.session_id} className="flex items-center gap-4 py-2.5 border-b border-gray-50 last:border-0">
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{s.title}</p>{s.coachee_reflection&&<p className="text-xs text-indigo-500 italic truncate">"{s.coachee_reflection}"</p>}</div>
                      <span className="text-xs text-gray-400 shrink-0">{new Date(s.scheduled_at).toLocaleDateString()}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${s.status==="completed"?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-500"}`}>{s.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}