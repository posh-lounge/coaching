"use client";
// ─── COACHEE GOALS PAGE ──────────────────────────────────────
import React, { useState } from "react";
import { Target, TrendingUp, CheckCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useCoacheeGoals, useCoacheeGoalAction } from "@/lib/api/v1/hooks";

const MOODS = [{ v:"excited",e:"🚀"},{v:"confident",e:"💪"},{v:"uncertain",e:"🤔"},{v:"struggling",e:"😰"},{v:"breakthrough",e:"⚡"}];

function UpdateModal({ goal, onClose }: { goal: any; onClose: () => void }) {
  const action = useCoacheeGoalAction();
  const [pct,  setPct]  = useState(goal.progress_pct);
  const [note, setNote] = useState("");
  const [mood, setMood] = useState("");
  const handle = async () => {
    await action.mutateAsync({ action:"add_update", goal_id:goal.goal_id, content:note||"Progress updated", progress_pct:pct, mood:mood||null });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Update Progress</h2>
        <p className="text-gray-500 text-sm mb-5">{goal.title}</p>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold text-gray-700">Progress</span><span className="text-2xl font-bold text-emerald-600">{pct}%</span></div>
          <input type="range" min={0} max={100} value={pct} onChange={e => setPct(+e.target.value)} className="w-full accent-emerald-600"/>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mt-2"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{width:`${pct}%`}}/></div>
        </div>
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">How are you feeling?</label>
          <div className="flex gap-2">{MOODS.map(m=><button key={m.v} onClick={()=>setMood(m.v)} className={`flex-1 text-xl py-2.5 rounded-xl border-2 transition ${mood===m.v?"border-emerald-500 bg-emerald-50":"border-gray-200 hover:border-emerald-200"}`}>{m.e}</button>)}</div>
        </div>
        <div className="mb-5"><label className="text-sm font-semibold text-gray-700 mb-1 block">Progress Note</label><textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="w-full border-2 border-gray-200 focus:border-emerald-400 rounded-xl p-3 text-sm resize-none outline-none" placeholder="What progress have you made? Any insights or blockers?"/></div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handle} disabled={action.isPending} className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
            {action.isPending&&<Loader2 size={14} className="animate-spin"/>}Update
          </button>
        </div>
      </div>
    </div>
  );
}

export function CoacheeGoalsPage() {
  const [filter, setFilter] = useState("active");
  const [updating, setUpdating] = useState<any>(null);
  const { data, isLoading } = useCoacheeGoals(filter && filter !== "all" ? { status: filter } : undefined);
  const action = useCoacheeGoalAction();
  const goals = data?.goals ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">My Goals</h1><p className="text-gray-500 text-sm mt-0.5">Goals set by your coach to guide your transformation</p></div>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[{l:"Total",v:goals.length,c:"text-gray-900"},{l:"Active",v:goals.filter((g:any)=>g.status==="active").length,c:"text-emerald-600"},{l:"Achieved",v:goals.filter((g:any)=>g.status==="achieved").length,c:"text-indigo-600"},{l:"Avg Progress",v:goals.length?`${Math.round(goals.reduce((s:number,g:any)=>s+g.progress_pct,0)/goals.length)}%`:"0%",c:"text-amber-600"}].map(s=>(
            <div key={s.l} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm"><p className={`text-2xl font-bold ${s.c}`}>{s.v}</p><p className="text-xs text-gray-400 mt-0.5">{s.l}</p></div>
          ))}
        </div>
        <div className="flex gap-2 mb-6">{["all","active","achieved","paused"].map(f=><button key={f} onClick={()=>setFilter(f)} className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition ${filter===f?"bg-emerald-600 text-white":"bg-white border border-gray-200 text-gray-600 hover:border-emerald-200"}`}>{f}</button>)}</div>
        {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-emerald-400"/></div>
          : goals.length === 0 ? <div className="text-center py-20 bg-white rounded-2xl border border-gray-100"><Target size={40} className="mx-auto mb-3 text-gray-200"/><h3 className="text-lg font-bold text-gray-700">No goals yet</h3><p className="text-gray-400 text-sm mt-1">Your coach will set goals for your coaching journey</p></div>
          : (
            <div className="space-y-4">
              {goals.map((g: any) => {
                const [exp, setExp] = useState(false);
                const isOverdue = g.target_date && new Date(g.target_date) < new Date() && g.status === "active";
                return (
                  <div key={g.goal_id} className={`bg-white rounded-2xl border-2 p-5 shadow-sm transition ${g.status==="achieved"?"border-emerald-200 bg-emerald-50/20":g.status==="paused"?"border-amber-200":"border-gray-100 hover:border-emerald-200"}`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {g.category&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">{g.category}</span>}
                          {g.status==="achieved"&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center gap-1"><CheckCircle size={9}/>Achieved!</span>}
                          {isOverdue&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-semibold">Overdue</span>}
                        </div>
                        <h3 className="font-bold text-gray-900">{g.title}</h3>
                        <p className="text-sm text-gray-500">Coach: {g.coach_name}</p>
                      </div>
                      {g.target_date && <span className="text-xs text-gray-400 shrink-0">{new Date(g.target_date).toLocaleDateString()}</span>}
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">Progress</span><span className="text-sm font-bold text-gray-900">{g.progress_pct}%</span></div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${g.status==="achieved"?"bg-emerald-500":g.progress_pct>=70?"bg-emerald-500":g.progress_pct>=40?"bg-amber-500":"bg-red-400"}`} style={{width:`${g.progress_pct}%`}}/></div>
                      {g.ms_total>0&&<p className="text-xs text-gray-400 mt-1">{g.ms_done}/{g.ms_total} milestones</p>}
                    </div>
                    {/* WHY */}
                    {g.why && <div className="mb-3 p-3 bg-amber-50 rounded-xl border border-amber-100"><p className="text-xs font-semibold text-amber-700 mb-0.5">🔥 Why this goal</p><p className="text-sm text-amber-900">{g.why}</p></div>}
                    {/* Milestones */}
                    {g.milestones?.length > 0 && (
                      <div className="mb-3">
                        <button onClick={()=>setExp(!exp)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2">{exp?<ChevronUp size={11}/>:<ChevronDown size={11}/>}Milestones ({g.ms_done}/{g.ms_total})</button>
                        {exp && <div className="space-y-1.5">{g.milestones.map((ms: any) => (
                          <div key={ms.milestone_id} className="flex items-center gap-2">
                            <button onClick={()=>!ms.is_completed&&action.mutate({action:"complete_milestone",milestone_id:ms.milestone_id})} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${ms.is_completed?"bg-emerald-500 border-emerald-500":"border-gray-300 hover:border-emerald-400"}`}>{ms.is_completed&&<CheckCircle size={11} className="text-white"/>}</button>
                            <span className={`text-sm flex-1 ${ms.is_completed?"line-through text-gray-400":"text-gray-700"}`}>{ms.title}</span>
                          </div>
                        ))}</div>}
                      </div>
                    )}
                    {/* Latest update */}
                    {g.updates?.[0] && <p className="text-xs text-gray-500 italic mb-3">"{g.updates[0].content}"</p>}
                    {g.status==="active" && <button onClick={()=>setUpdating(g)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition"><TrendingUp size={14}/>Update Progress</button>}
                  </div>
                );
              })}
            </div>
          )}
      </div>
      {updating && <UpdateModal goal={updating} onClose={()=>setUpdating(null)}/>}
    </div>
  );
}

export default CoacheeGoalsPage;
