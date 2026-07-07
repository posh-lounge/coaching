"use client";
import React, { useState } from "react";
import { BarChart2, Loader2, Star, Target, CheckSquare, Calendar } from "lucide-react";
import { useCoachees, useProgressReport } from "@/lib/api/v1/hooks";

function ReportView({ relId }: { relId: number }) {
  const { data, isLoading } = useProgressReport(relId);
  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400"/></div>;
  const r = data;
  if (!r) return null;

  const sessionsDone  = r.session_stats?.find((s: any) => s.status === "completed")?.cnt ?? 0;
  const tasksDone     = r.task_stats?.filter((t: any) => t.status === "reviewed").reduce((a: number, t: any) => a + (+t.cnt), 0) ?? 0;
  const goalsAchieved = r.goals?.filter((g: any) => g.status === "achieved").length ?? 0;
  const goalsActive   = r.goals?.filter((g: any) => g.status === "active").length ?? 0;

  const maxFreq = r.session_frequency?.length ? Math.max(...r.session_frequency.map((d: any) => +d.sessions)) || 1 : 1;

  return (
    <div className="space-y-5">
      {/* Relationship header */}
      <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-indigo-50 shrink-0">
          {r.relationship?.coachee_photo ? <img src={r.relationship.coachee_photo} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-xl">{r.relationship?.coachee_name?.[0]}</div>}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{r.relationship?.coachee_name}</h2>
          <p className="text-gray-500 text-sm">{r.relationship?.rel_type?.replace("_"," ")} · started {r.relationship?.started_at ? new Date(r.relationship.started_at).toLocaleDateString() : "—"}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600">{r.relationship?.sessions_remaining}</p>
          <p className="text-xs text-gray-400">sessions remaining</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[{ l: "Sessions Done", v: sessionsDone, c: "text-indigo-600", icon: <Calendar size={16} className="text-indigo-400"/> }, { l: "Tasks Done", v: tasksDone, c: "text-violet-600", icon: <CheckSquare size={16} className="text-violet-400"/> }, { l: "Goals Active", v: goalsActive, c: "text-amber-600", icon: <Target size={16} className="text-amber-400"/> }, { l: "Goals Achieved", v: goalsAchieved, c: "text-emerald-600", icon: <Target size={16} className="text-emerald-400"/> }].map(s => (
          <div key={s.l} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            {s.icon}
            <p className={`text-2xl font-bold mt-2 ${s.c}`}>{s.v}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Session frequency chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Calendar size={15} className="text-indigo-500"/>Session Frequency</h3>
          {r.session_frequency?.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No completed sessions yet</p> : (
            <div className="flex items-end gap-1.5 h-24">
              {r.session_frequency?.map((d: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-indigo-400 rounded-t-lg hover:bg-indigo-500 transition cursor-default" style={{ height: `${(+d.sessions / maxFreq) * 100}%` }} title={`${d.month}: ${d.sessions}`}/>
                  <span className="text-[8px] text-gray-400">{d.month?.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Star size={15} className="text-amber-400"/>Reviews</h3>
          {r.reviews?.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No reviews yet</p> : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <p className="text-4xl font-bold text-gray-900">{Number(r.avg_rating).toFixed(1)}</p>
                <div>
                  <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <span key={i} className={i <= Math.round(r.avg_rating) ? "text-amber-400" : "text-gray-200"}>★</span>)}</div>
                  <p className="text-xs text-gray-400 mt-0.5">{r.reviews?.length} review{r.reviews?.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {r.reviews?.slice(0, 3).map((rv: any) => (
                  <div key={rv.review_id} className="bg-gray-50 rounded-xl p-2.5">
                    <div className="flex gap-0.5 mb-1">{[1,2,3,4,5].map(i => <span key={i} className={`text-sm ${i <= rv.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>)}</div>
                    {rv.comment && <p className="text-xs text-gray-600">"{rv.comment}"</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Goals */}
      {r.goals?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Target size={15} className="text-emerald-500"/>Goals</h3>
          <div className="space-y-3">
            {r.goals.map((g: any) => (
              <div key={g.goal_id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{g.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${g.status === "achieved" ? "bg-emerald-50 text-emerald-700" : g.status === "active" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>{g.status}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${g.status === "achieved" ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${g.progress_pct}%` }}/>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-700 shrink-0">{g.progress_pct}%</span>
                {g.total_ms > 0 && <span className="text-xs text-gray-400 shrink-0">{g.done_ms}/{g.total_ms}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competencies */}
      {r.competencies?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Coaching Competencies</h3>
          <div className="grid grid-cols-2 gap-3">
            {r.competencies.map((c: any) => (
              <div key={c.competency}>
                <div className="flex items-center justify-between mb-1"><span className="text-sm text-gray-700">{c.competency}</span><span className="text-sm font-bold">{Number(c.avg_score).toFixed(1)}/5</span></div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${+c.avg_score >= 4 ? "bg-emerald-500" : +c.avg_score >= 3 ? "bg-indigo-500" : "bg-amber-500"}`} style={{ width: `${(+c.avg_score / 5) * 100}%` }}/></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {r.recent_sessions?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Recent Sessions</h3>
          {r.recent_sessions.map((s: any) => (
            <div key={s.session_id} className="flex items-center gap-4 py-2.5 border-b border-gray-50 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{s.title}</p>
                {s.session_summary && <p className="text-xs text-gray-400 truncate">{s.session_summary}</p>}
                {s.coachee_reflection && <p className="text-xs text-indigo-500 italic truncate mt-0.5">"{s.coachee_reflection}"</p>}
              </div>
              <span className="text-xs text-gray-400 shrink-0">{new Date(s.scheduled_at).toLocaleDateString()}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-medium capitalize ${s.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-500"}`}>{s.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoachProgressPage() {
  const { data: coacheesData } = useCoachees("active");
  const [selectedRelId, setSelectedRelId] = useState<number | null>(null);
  const coachees = coacheesData?.coachees ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Progress Reports</h1>
          <p className="text-gray-500 text-sm mt-0.5">Deep dive into each coachee's journey</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Select Coachee</label>
          <select value={selectedRelId ?? ""} onChange={e => setSelectedRelId(e.target.value ? +e.target.value : null)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
            <option value="">Choose a coachee to view their full report...</option>
            {coachees.map((c: any) => <option key={c.rel_id} value={c.rel_id}>{c.display_name} — {c.sessions_used ?? 0} sessions done</option>)}
          </select>
        </div>

        {!selectedRelId ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <BarChart2 size={40} className="mx-auto mb-3 text-gray-200"/>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Select a coachee above</h3>
            <p className="text-gray-400 text-sm">See sessions, tasks, goals, reviews, competencies and more</p>
          </div>
        ) : <ReportView relId={selectedRelId}/>}
      </div>
    </div>
  );
}
