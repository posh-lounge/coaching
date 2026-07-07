"use client";
import React, { useState } from "react";
import { Calendar, Plus, X, Loader2, Video, MapPin, Clock, CheckCircle, XCircle, Edit3, MessageSquare, Star } from "lucide-react";
import { useCoachSessions, useCoachSessionAction, useCoachees } from "@/lib/api/v1/hooks";

const STATUS_STYLES: Record<string, string> = {
  scheduled:  "bg-blue-50 text-blue-700 border-blue-200",
  confirmed:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed:  "bg-gray-100 text-gray-600 border-gray-200",
  cancelled:  "bg-red-50 text-red-500 border-red-200",
  no_show:    "bg-amber-50 text-amber-700 border-amber-200",
};

function CreateSessionModal({ onClose }: { onClose: () => void }) {
  const action = useCoachSessionAction();
  const { data } = useCoachees("active");
  const rels = data?.coachees ?? [];
  const [f, setF] = useState({ rel_id: "", title: "", session_type: "online", meeting_link: "", location: "", scheduled_at: "", duration_mins: "60", agenda: "" });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const handle = async () => {
    if (!f.rel_id || !f.title || !f.scheduled_at) return;
    await action.mutateAsync({ action: "create", ...f, rel_id: +f.rel_id, duration_mins: +f.duration_mins });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
          <h2 className="text-white font-bold text-xl">Schedule Session</h2>
          <p className="text-indigo-200 text-sm mt-0.5">Plan a transformative coaching session</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Coachee *</label>
            <select value={f.rel_id} onChange={e => set("rel_id", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
              <option value="">Select coachee...</option>
              {rels.map((r: any) => <option key={r.rel_id} value={r.rel_id}>{r.display_name} ({r.sessions_remaining} left)</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Session Title *</label>
            <input value={f.title} onChange={e => set("title", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="e.g. Goal Setting Deep Dive"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Type</label>
              <div className="flex gap-2">
                {["online", "in_person"].map(t => (
                  <button key={t} onClick={() => set("session_type", t)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition capitalize ${f.session_type === t ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-500 hover:border-indigo-200"}`}>
                    {t === "online" ? "🔗 Online" : "📍 In-person"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Duration</label>
              <select value={f.duration_mins} onChange={e => set("duration_mins", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
                {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} mins</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Date & Time *</label>
            <input type="datetime-local" value={f.scheduled_at} onChange={e => set("scheduled_at", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none"/>
          </div>
          {f.session_type === "online" ? (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Meeting Link</label>
              <input value={f.meeting_link} onChange={e => set("meeting_link", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="https://meet.google.com/..."/>
            </div>
          ) : (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Location</label>
              <input value={f.location} onChange={e => set("location", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="Office address or venue"/>
            </div>
          )}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Agenda (optional)</label>
            <textarea value={f.agenda} onChange={e => set("agenda", e.target.value)} rows={3} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="What will you cover in this session?"/>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handle} disabled={action.isPending || !f.rel_id || !f.title || !f.scheduled_at} className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
            {action.isPending && <Loader2 size={14} className="animate-spin"/>}<Calendar size={15}/>Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

function NotesModal({ session, onClose }: { session: any; onClose: () => void }) {
  const action = useCoachSessionAction();
  const [summary, setSummary] = useState(session.session_summary ?? "");
  const [notes,   setNotes]   = useState(session.coach_notes ?? "");
  const handle = async () => {
    await action.mutateAsync({ action: "add_notes", session_id: session.session_id, session_summary: summary, coach_notes: notes });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Session Notes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>
        <p className="text-sm text-gray-500 mb-4 font-medium">{session.title}</p>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Session Summary (shared with coachee)</label>
            <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={4} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl p-3 text-sm resize-none outline-none" placeholder="Key takeaways, breakthroughs, what was covered..."/>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Private Coach Notes (only you see this)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl p-3 text-sm resize-none outline-none" placeholder="Your private observations, follow-up ideas..."/>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handle} disabled={action.isPending} className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
            {action.isPending && <Loader2 size={14} className="animate-spin"/>}Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoachSessionsPage() {
  const [filter,  setFilter]  = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [notesSession, setNotesSession] = useState<any>(null);
  const { data, isLoading } = useCoachSessions(filter ? { status: filter } : undefined);
  const action = useCoachSessionAction();
  const sessions = data?.sessions ?? [];

  const grouped: Record<string, any[]> = {};
  sessions.forEach(s => {
    const key = new Date(s.scheduled_at).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
            <p className="text-gray-500 text-sm mt-0.5">{sessions.length} session{sessions.length !== 1 ? "s" : ""} found</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition">
            <Plus size={16}/>Schedule Session
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[{ v: "", l: "All" }, { v: "scheduled", l: "Scheduled" }, { v: "confirmed", l: "Confirmed" }, { v: "completed", l: "Completed" }, { v: "cancelled", l: "Cancelled" }].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)} className={`px-4 py-1.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${filter === f.v ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-200"}`}>{f.l}</button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400"/></div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Calendar size={40} className="mx-auto mb-3 text-gray-200"/>
            <h3 className="text-lg font-bold text-gray-700 mb-1">No sessions found</h3>
            <p className="text-gray-400 text-sm mb-5">Your coaching sessions will appear here</p>
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-500 transition"><Plus size={14}/>Schedule First Session</button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, daySessions]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">{date}</h3>
                <div className="space-y-3">
                  {daySessions.map(s => (
                    <div key={s.session_id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 transition shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-50 shrink-0">
                          {s.coachee_photo ? <img src={s.coachee_photo} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold">{s.coachee_name?.[0]}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-bold text-gray-900">{s.title}</h3>
                              <p className="text-sm text-gray-500">{s.coachee_name}</p>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border capitalize shrink-0 ${STATUS_STYLES[s.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>{s.status}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Clock size={11}/>{new Date(s.scheduled_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} · {s.duration_mins}min</span>
                            <span className="flex items-center gap-1">{s.session_type === "online" ? <><Video size={11}/>Online</> : <><MapPin size={11}/>In-person</>}</span>
                          </div>
                          {s.session_summary && <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mt-3 italic">"{s.session_summary}"</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                        {s.status === "scheduled" && <button onClick={() => action.mutate({ action: "confirm", session_id: s.session_id })} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 transition"><CheckCircle size={12}/>Confirm</button>}
                        {s.status === "confirmed" && <button onClick={() => action.mutate({ action: "complete", session_id: s.session_id })} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 hover:bg-indigo-100 transition"><CheckCircle size={12}/>Mark Complete</button>}
                        {(s.status === "scheduled" || s.status === "confirmed") && <button onClick={() => action.mutate({ action: "cancel", session_id: s.session_id, reason: "Cancelled by coach" })} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-xl text-xs font-semibold border border-red-200 hover:bg-red-100 transition"><XCircle size={12}/>Cancel</button>}
                        <button onClick={() => setNotesSession(s)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-100 transition"><Edit3 size={12}/>Notes</button>
                        {s.meeting_link && <a href={s.meeting_link} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200 hover:bg-blue-100 transition"><Video size={12}/>Join</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showCreate && <CreateSessionModal onClose={() => setShowCreate(false)}/>}
      {notesSession && <NotesModal session={notesSession} onClose={() => setNotesSession(null)}/>}
    </div>
  );
}
