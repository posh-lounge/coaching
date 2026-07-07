"use client";
import React, { useState } from "react";
import { BookOpen, Plus, X, Loader2, Lock, Eye, Edit3, Trash2, TrendingUp } from "lucide-react";
import { useJournals, useJournalAction, useCoachCompetencies } from "@/lib/api/v1/hooks";

const MOODS = [{ v: "energized", e: "⚡", l: "Energized" }, { v: "confident", e: "💪", l: "Confident" }, { v: "uncertain", e: "🤔", l: "Uncertain" }, { v: "challenged", e: "😤", l: "Challenged" }, { v: "breakthrough", e: "🌟", l: "Breakthrough" }];

function JournalModal({ existing, onClose }: { existing?: any; onClose: () => void }) {
  const action = useJournalAction();
  const [f, setF] = useState({ title: existing?.title ?? "", content: existing?.content ?? "", mood: existing?.mood ?? "", is_private: existing?.is_private ?? 1, share_with_supervisor: existing?.share_with_supervisor ?? 0 });
  const set = (k: string, v: any) => setF(p => ({ ...p, [k]: v }));

  const handle = async () => {
    if (!f.title || !f.content) return;
    if (existing) await action.mutateAsync({ action: "update", journal_id: existing.journal_id, ...f });
    else await action.mutateAsync({ action: "create", ...f });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5 shrink-0">
          <h2 className="text-white font-bold text-xl">{existing ? "Edit Journal Entry" : "New Reflection"}</h2>
          <p className="text-violet-200 text-sm">Your private space to grow as a coach</p>
        </div>
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Title *</label>
            <input value={f.title} onChange={e => set("title", e.target.value)} className="w-full border-2 border-gray-200 focus:border-violet-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="e.g. Breakthrough with Sarah today..."/>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">How are you feeling?</label>
            <div className="flex gap-2">
              {MOODS.map(m => <button key={m.v} onClick={() => set("mood", m.v)} className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border-2 transition ${f.mood === m.v ? "border-violet-600 bg-violet-50" : "border-gray-200 hover:border-violet-200"}`}><span className="text-xl">{m.e}</span><span className={`text-[10px] font-medium mt-0.5 ${f.mood === m.v ? "text-violet-700" : "text-gray-400"}`}>{m.l}</span></button>)}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Reflection *</label>
            <textarea value={f.content} onChange={e => set("content", e.target.value)} rows={8} className="w-full border-2 border-gray-200 focus:border-violet-400 rounded-xl px-4 py-3 text-sm outline-none resize-none leading-relaxed" placeholder={"What happened in your sessions today?\nWhat worked well? What challenged you?\nWhat are you learning about yourself as a coach?\nWhat would you do differently?"}/>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!f.is_private} onChange={e => set("is_private", e.target.checked ? 1 : 0)} className="w-4 h-4 rounded text-violet-600"/>
              <span className="text-sm text-gray-700 flex items-center gap-1"><Lock size={13} className="text-gray-400"/>Private entry</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!f.share_with_supervisor} onChange={e => set("share_with_supervisor", e.target.checked ? 1 : 0)} className="w-4 h-4 rounded text-violet-600"/>
              <span className="text-sm text-gray-700 flex items-center gap-1"><Eye size={13} className="text-gray-400"/>Share with supervisor</span>
            </label>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handle} disabled={action.isPending || !f.title || !f.content} className="flex-1 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
            {action.isPending && <Loader2 size={14} className="animate-spin"/>}<BookOpen size={15}/>{existing ? "Update" : "Save Reflection"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoachGrowthPage() {
  const [tab, setTab]         = useState<"journal" | "competencies">("journal");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing]   = useState<any>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const { data: jData, isLoading: jLoading } = useJournals();
  const { data: cData } = useCoachCompetencies();
  const action     = useJournalAction();
  const journals   = jData?.journals     ?? [];
  const comps      = cData?.competencies ?? [];

  const MOOD_MAP: Record<string, string> = { energized:"⚡", confident:"💪", uncertain:"🤔", challenged:"😤", breakthrough:"🌟" };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Growth</h1>
            <p className="text-gray-500 text-sm mt-0.5">Reflect, learn, and grow as a coach</p>
          </div>
          {tab === "journal" && <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition"><Plus size={16}/>New Reflection</button>}
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("journal")} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === "journal" ? "bg-violet-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-violet-200"}`}>📓 Journal</button>
          {comps.length > 0 && <button onClick={() => setTab("competencies")} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === "competencies" ? "bg-violet-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-violet-200"}`}>📊 Competencies</button>}
        </div>

        {tab === "journal" && (
          jLoading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-violet-400"/></div>
          : journals.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <BookOpen size={40} className="mx-auto mb-3 text-gray-200"/>
              <h3 className="text-lg font-bold text-gray-700 mb-1">Start your coaching journal</h3>
              <p className="text-gray-400 text-sm mb-5">Regular reflection is what separates good coaches from great ones</p>
              <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-500 transition"><Plus size={14}/>First Reflection</button>
            </div>
          ) : (
            <div className="space-y-3">
              {journals.map((j: any) => (
                <div key={j.journal_id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:border-violet-200 transition">
                  <button className="w-full text-left p-5" onClick={() => setExpanded(expanded === j.journal_id ? null : j.journal_id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {j.mood && <span className="text-lg">{MOOD_MAP[j.mood] ?? "📝"}</span>}
                          <h3 className="font-bold text-gray-900 truncate">{j.title}</h3>
                          {j.is_private ? <Lock size={12} className="text-gray-300 shrink-0"/> : <Eye size={12} className="text-indigo-400 shrink-0"/>}
                          {j.share_with_supervisor ? <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">Shared</span> : null}
                        </div>
                        <p className="text-xs text-gray-400">{new Date(j.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={e => { e.stopPropagation(); setEditing(j); }} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Edit3 size={14}/></button>
                        <button onClick={e => { e.stopPropagation(); action.mutate({ action: "delete", journal_id: j.journal_id }); }} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={14}/></button>
                      </div>
                    </div>
                    {expanded !== j.journal_id && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{j.content}</p>}
                  </button>
                  {expanded === j.journal_id && <div className="px-5 pb-5"><div className="bg-gray-50 rounded-xl p-4"><p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{j.content}</p></div></div>}
                </div>
              ))}
            </div>
          )
        )}

        {tab === "competencies" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5"><TrendingUp size={18} className="text-violet-500"/><h2 className="font-bold text-gray-900">Coaching Competencies</h2><p className="text-gray-400 text-sm ml-2">Assessed by your supervisor</p></div>
            {comps.length === 0 ? <div className="text-center py-12"><p className="text-gray-400 text-sm">No competency assessments yet. Get a supervisor to assess you.</p></div> : (
              <div className="grid grid-cols-2 gap-4">
                {comps.map((c: any) => (
                  <div key={c.competency}>
                    <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-gray-700">{c.competency}</span><span className="text-sm font-bold text-gray-900">{Number(c.avg).toFixed(1)}/5</span></div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${Number(c.avg) >= 4 ? "bg-emerald-500" : Number(c.avg) >= 3 ? "bg-indigo-500" : "bg-amber-500"}`} style={{ width: `${(Number(c.avg) / 5) * 100}%` }}/></div>
                    <p className="text-xs text-gray-400 mt-0.5">{c.scores?.length} assessment{c.scores?.length !== 1 ? "s" : ""}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {(showCreate || editing) && <JournalModal existing={editing} onClose={() => { setShowCreate(false); setEditing(null); }}/>}
    </div>
  );
}
