"use client";
import React, { useState } from "react";
import { Calendar, Plus, X, Loader2, Star, Video, MapPin, Clock, CheckCircle } from "lucide-react";
import { useCoacheeSessions, useCoacheeSessionAction } from "@/lib/api/v1/hooks";

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
  cancelled: "bg-red-50 text-red-500 border-red-200",
};

function RequestSessionModal({ onClose }: { onClose: () => void }) {
  const action = useCoacheeSessionAction();
  const [f, setF] = useState({ rel_id: "", title: "", session_type: "online", meeting_link: "", scheduled_at: "", duration_mins: "60", agenda: "" });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const handle = async () => {
    if (!f.rel_id || !f.title || !f.scheduled_at) return;
    await action.mutateAsync({ action: "create", ...f, rel_id: +f.rel_id, duration_mins: +f.duration_mins });
    onClose();
  };
  // NOTE: In production, fetch coachee's active relationships to populate rel_id select
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5">
          <h2 className="text-white font-bold text-xl">Request a Session</h2>
          <p className="text-violet-200 text-sm">Propose a time that works for you</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Relationship ID</label>
            <input value={f.rel_id} onChange={e => set("rel_id", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="Your relationship ID"/>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">What do you want to work on? *</label>
            <input value={f.title} onChange={e => set("title", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="e.g. Reviewing my action plan for Q3"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Type</label>
              <div className="flex gap-2">
                {["online","in_person"].map(t => <button key={t} onClick={() => set("session_type", t)} className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition ${f.session_type === t ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-500"}`}>{t === "online" ? "🔗 Online" : "📍 In-person"}</button>)}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Duration</label>
              <select value={f.duration_mins} onChange={e => set("duration_mins", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2 text-sm outline-none bg-white">
                {[30,45,60,90,120].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Proposed Date & Time *</label>
            <input type="datetime-local" value={f.scheduled_at} onChange={e => set("scheduled_at", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none"/>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Agenda / Notes</label>
            <textarea value={f.agenda} onChange={e => set("agenda", e.target.value)} rows={2} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="What specific topics or questions do you want to bring?"/>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handle} disabled={action.isPending || !f.title || !f.scheduled_at} className="flex-1 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
            {action.isPending && <Loader2 size={14} className="animate-spin"/>}<Calendar size={15}/>Request
          </button>
        </div>
      </div>
    </div>
  );
}

function ReflectionModal({ session, onClose }: { session: any; onClose: () => void }) {
  const action = useCoacheeSessionAction();
  const [reflection, setReflection] = useState(session.coachee_reflection ?? "");
  const [energy, setEnergy] = useState(session.energy_level ?? 3);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [step, setStep] = useState<"reflection" | "review">("reflection");

  const saveReflection = async () => {
    await action.mutateAsync({ action: "submit_reflection", session_id: session.session_id, reflection, energy_level: energy });
    setStep("review");
  };
  const saveReview = async () => {
    if (rating > 0) await action.mutateAsync({ action: "submit_review", session_id: session.session_id, rating, comment });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
        {step === "reflection" ? (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Session Reflection</h2>
            <p className="text-gray-500 text-sm mb-5">{session.title}</p>
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Your Takeaways</label>
              <textarea value={reflection} onChange={e => setReflection(e.target.value)} rows={4} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl p-3 text-sm resize-none outline-none" placeholder={"What are your key insights from this session?\nWhat will you do differently?\nWhat commitments are you making?"}/>
            </div>
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">How do you feel after this session?</label>
              <div className="flex gap-2">
                {[{ v: 1, e: "😔" }, { v: 2, e: "😐" }, { v: 3, e: "🙂" }, { v: 4, e: "😊" }, { v: 5, e: "🤩" }].map(({ v, e }) => (
                  <button key={v} onClick={() => setEnergy(v)} className={`flex-1 text-2xl py-3 rounded-xl border-2 transition ${energy === v ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-indigo-200"}`}>{e}</button>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 mt-1">{["","Exhausted","Okay","Good","Energized","Transformed!"][energy]}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Skip</button>
              <button onClick={saveReflection} disabled={action.isPending} className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
                {action.isPending && <Loader2 size={14} className="animate-spin"/>}Save & Continue →
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Rate This Session</h2>
            <p className="text-gray-500 text-sm mb-5">Your feedback helps your coach improve</p>
            <div className="flex justify-center gap-3 mb-4">
              {[1,2,3,4,5].map(s => <button key={s} onClick={() => setRating(s)} className={`text-4xl transition ${s <= rating ? "text-amber-400 scale-110" : "text-gray-200 hover:text-amber-200"}`}>★</button>)}
            </div>
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Comment (optional)</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl p-3 text-sm resize-none outline-none" placeholder="What specifically helped? What would make sessions even better?"/>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Skip</button>
              <button onClick={saveReview} disabled={action.isPending || rating === 0} className="flex-1 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
                {action.isPending && <Loader2 size={14} className="animate-spin"/>}<Star size={14}/>Submit Review
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CoacheeSessionsPage() {
  const [filter, setFilter] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [reflecting, setReflecting]   = useState<any>(null);
  const { data, isLoading } = useCoacheeSessions(filter ? { status: filter } : undefined);
  const action = useCoacheeSessionAction();
  const sessions = data?.sessions ?? [];

  const grouped: Record<string, any[]> = {};
  sessions.forEach(s => {
    const key = new Date(s.scheduled_at).toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
            <p className="text-gray-500 text-sm mt-0.5">{sessions.length} session{sessions.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => setShowRequest(true)} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition"><Plus size={16}/>Request Session</button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[{ v:"",l:"All"},{v:"scheduled",l:"Upcoming"},{v:"confirmed",l:"Confirmed"},{v:"completed",l:"Completed"},{v:"cancelled",l:"Cancelled"}].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)} className={`px-4 py-1.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${filter === f.v ? "bg-violet-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-violet-200"}`}>{f.l}</button>
          ))}
        </div>

        {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-violet-400"/></div>
          : sessions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Calendar size={40} className="mx-auto mb-3 text-gray-200"/>
              <h3 className="text-lg font-bold text-gray-700 mb-1">No sessions yet</h3>
              <p className="text-gray-400 text-sm mb-5">Sessions with your coach will appear here</p>
              <button onClick={() => setShowRequest(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-500 transition"><Plus size={14}/>Request First Session</button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([date, day]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">{date}</h3>
                  <div className="space-y-3">
                    {day.map(s => (
                      <div key={s.session_id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-violet-200 transition shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-violet-50 shrink-0">
                            {s.coach_photo ? <img src={s.coach_photo} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-violet-600 font-bold">{s.coach_name?.[0]}</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-bold text-gray-900">{s.title}</h3>
                                <p className="text-sm text-gray-500">{s.coach_name}</p>
                              </div>
                              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border capitalize shrink-0 ${STATUS_STYLES[s.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>{s.status}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                              <span className="flex items-center gap-1"><Clock size={11}/>{new Date(s.scheduled_at).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})} · {s.duration_mins}min</span>
                              <span className="flex items-center gap-1">{s.session_type === "online" ? <><Video size={11}/>Online</> : <><MapPin size={11}/>In-person</>}</span>
                            </div>
                            {s.session_summary && <div className="mt-3 p-3 bg-indigo-50 rounded-xl"><p className="text-xs font-semibold text-indigo-600 mb-1">Coach Summary</p><p className="text-sm text-gray-700">{s.session_summary}</p></div>}
                            {s.agenda && !s.session_summary && <p className="text-sm text-gray-500 mt-2 italic">"{s.agenda}"</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50 flex-wrap">
                          {s.meeting_link && s.status === "confirmed" && <a href={s.meeting_link} target="_blank" className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-500 transition"><Video size={12}/>Join Session</a>}
                          {["scheduled","confirmed"].includes(s.status) && <button onClick={() => action.mutate({ action:"cancel", session_id:s.session_id, reason:"Cancelled by coachee" })} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-xl text-xs font-semibold border border-red-200 hover:bg-red-100 transition">Cancel</button>}
                          {s.status === "completed" && !s.coachee_reflection && <button onClick={() => setReflecting(s)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 hover:bg-indigo-100 transition"><CheckCircle size={12}/>Add Reflection & Review</button>}
                          {s.status === "completed" && s.coachee_reflection && <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle size={11}/>Reflection added</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
      {showRequest && <RequestSessionModal onClose={() => setShowRequest(false)}/>}
      {reflecting && <ReflectionModal session={reflecting} onClose={() => setReflecting(null)}/>}
    </div>
  );
}
