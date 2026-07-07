"use client";
import React, { useState } from "react";
import { Users, Search, MessageCircle, BarChart2, BookOpen, X, Loader2, ChevronRight, Edit3, Clock } from "lucide-react";
import Link from "next/link";
import { useCoachees, useCoacheeAction, useProgressReport } from "@/lib/api/v1/hooks";

function ProgressReportPanel({ rel, onClose }: { rel: any; onClose: () => void }) {
  const { data, isLoading } = useProgressReport(rel.rel_id);
  const r = data;

  const sessionsDone = r?.session_stats?.find((s: any) => s.status === "completed")?.cnt ?? 0;
  const tasksDone    = r?.task_stats?.filter((t: any) => t.status === "reviewed").reduce((a: number, t: any) => a + (+t.cnt), 0) ?? 0;
  const goalsActive  = r?.goals?.filter((g: any) => g.status === "active").length ?? 0;
  const goalsAchieved= r?.goals?.filter((g: any) => g.status === "achieved").length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Progress Report</h2>
            <p className="text-gray-500 text-sm">{rel.display_name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition"><X size={18}/></button>
        </div>
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-12"><Loader2 size={24} className="animate-spin text-indigo-400"/></div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              {[{ l: "Sessions Done", v: sessionsDone, c: "text-indigo-600" }, { l: "Tasks Done", v: tasksDone, c: "text-violet-600" }, { l: "Goals Active", v: goalsActive, c: "text-amber-600" }, { l: "Goals Achieved", v: goalsAchieved, c: "text-emerald-600" }].map(s => (
                <div key={s.l} className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
            {/* Session frequency */}
            {r?.session_frequency?.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Session Frequency</h3>
                <div className="flex items-end gap-1.5 h-16 bg-gray-50 rounded-xl px-3 py-2">
                  {(() => { const max = Math.max(...r.session_frequency.map((d: any) => +d.sessions)) || 1; return r.session_frequency.map((d: any, i: number) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-indigo-400 rounded-t" style={{ height: `${(+d.sessions / max) * 100}%` }}/>
                      <span className="text-[8px] text-gray-400">{d.month?.slice(5)}</span>
                    </div>
                  )); })()}
                </div>
              </div>
            )}
            {/* Goals */}
            {r?.goals?.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Goals</h3>
                <div className="space-y-2">
                  {r.goals.map((g: any) => (
                    <div key={g.goal_id} className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{g.title}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${g.status === "achieved" ? "bg-emerald-50 text-emerald-700" : g.status === "active" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>{g.status}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${g.status === "achieved" ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${g.progress_pct}%` }}/>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 shrink-0">{g.progress_pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Reviews */}
            {r?.avg_rating > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">Session Reviews</h3>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold text-gray-900">{Number(r.avg_rating).toFixed(1)}</p>
                  <div>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <span key={i} className={`text-lg ${i <= Math.round(r.avg_rating) ? "text-amber-400" : "text-gray-200"}`}>★</span>)}</div>
                    <p className="text-xs text-gray-400">{r.reviews?.length} review{r.reviews?.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </div>
            )}
            {/* Recent sessions */}
            {r?.recent_sessions?.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Recent Sessions</h3>
                <div className="space-y-2">
                  {r.recent_sessions.slice(0, 5).map((s: any) => (
                    <div key={s.session_id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-medium text-gray-900 truncate">{s.title}</p>
                        {s.session_summary && <p className="text-xs text-gray-400 truncate">{s.session_summary}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-400">{new Date(s.scheduled_at).toLocaleDateString()}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${s.status === "completed" ? "bg-emerald-50 text-emerald-700" : s.status === "cancelled" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-700"}`}>{s.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NotesModal({ rel, onClose }: { rel: any; onClose: () => void }) {
  const action = useCoacheeAction();
  const [notes, setNotes] = useState(rel.coach_notes ?? "");
  const save = async () => { await action.mutateAsync({ action: "update_notes", rel_id: rel.rel_id, coach_notes: notes }); onClose(); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Private Notes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>
        <p className="text-gray-500 text-sm mb-4">Notes about {rel.display_name} — only you can see these.</p>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={6} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl p-3 text-sm resize-none outline-none leading-relaxed" placeholder="Observations, patterns, follow-up ideas, things to remember about this coachee..."/>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={save} disabled={action.isPending} className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
            {action.isPending && <Loader2 size={14} className="animate-spin"/>}Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoachCoacheesPage() {
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("active");
  const [report,    setReport]    = useState<any>(null);
  const [notes,     setNotes]     = useState<any>(null);
  const { data, isLoading } = useCoachees(filter);
  const action = useCoacheeAction();
  const coachees = (data?.coachees ?? []).filter((c: any) =>
    !search || c.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Coachees</h1>
            <p className="text-gray-500 text-sm mt-0.5">{coachees.length} {filter} relationship{coachees.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/coaching" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition">
            <Users size={14}/>Find New Coachees
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coachees..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-400 bg-white"/>
          </div>
          <div className="flex gap-2">
            {["active","ended","all"].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${filter === f ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-200"}`}>{f}</button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400"/></div>
        ) : coachees.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Users size={40} className="mx-auto mb-3 text-gray-200"/>
            <h3 className="text-lg font-bold text-gray-700 mb-1">{search ? "No results" : "No coachees yet"}</h3>
            <p className="text-gray-400 text-sm">Your coaching relationships will appear here once coachees connect with you</p>
          </div>
        ) : (
          <div className="space-y-3">
            {coachees.map((c: any) => (
              <div key={c.rel_id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 transition shadow-sm">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-indigo-50 shrink-0">
                    {c.profile_photo ? <img src={c.profile_photo} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-xl">{c.display_name?.[0]}</div>}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{c.display_name}</h3>
                        {c.occupation && <p className="text-sm text-gray-500">{c.occupation}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${c.status === "active" ? "bg-emerald-50 text-emerald-700" : c.status === "paused" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`}>{c.status}</span>
                      </div>
                    </div>
                    {/* Stats */}
                    <div className="flex items-center gap-5 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1.5"><Clock size={13} className="text-indigo-400"/>{c.sessions_remaining} sessions left</span>
                      <span>{c.sessions_done ?? 0} completed</span>
                      <span>{c.tasks_done ?? 0} tasks done</span>
                      <span>{c.goals_active ?? 0} active goals · {c.goals_achieved ?? 0} achieved</span>
                      {c.unread > 0 && <span className="flex items-center gap-1 text-red-500 font-semibold"><MessageCircle size={13}/>{c.unread} unread</span>}
                    </div>
                    {/* Session progress bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Session usage</span>
                        <span className="text-xs text-gray-500">{c.sessions_used ?? 0}/{c.sessions_paid ?? 0}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${c.sessions_paid ? ((c.sessions_used ?? 0) / c.sessions_paid) * 100 : 0}%` }}/>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/coach/messages?rel=${c.rel_id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 hover:bg-indigo-100 transition">
                        <MessageCircle size={12}/>Message {c.unread > 0 && `(${c.unread})`}
                      </Link>
                      <button onClick={() => setReport(c)} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-xl text-xs font-semibold border border-violet-200 hover:bg-violet-100 transition">
                        <BarChart2 size={12}/>Progress Report
                      </button>
                      <Link href={`/coach/sessions?rel=${c.rel_id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-100 transition">
                        <BookOpen size={12}/>Sessions
                      </Link>
                      <Link href={`/coach/goals?rel=${c.rel_id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 transition">
                        Goals
                      </Link>
                      <button onClick={() => setNotes(c)} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold border border-amber-200 hover:bg-amber-100 transition">
                        <Edit3 size={12}/>Notes
                      </button>
                      {c.status === "active" && (
                        <button onClick={() => { if (confirm(`End relationship with ${c.display_name}?`)) action.mutate({ action: "end_relationship", rel_id: c.rel_id, reason: "Ended by coach" }); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-xl text-xs font-semibold border border-red-200 hover:bg-red-100 transition ml-auto">
                          End Relationship
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {report && <ProgressReportPanel rel={report} onClose={() => setReport(null)}/>}
      {notes  && <NotesModal rel={notes} onClose={() => setNotes(null)}/>}
    </div>
  );
}
