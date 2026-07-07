"use client";
import React, { useState } from "react";
import { Target, Plus, X, Loader2, CheckCircle, Clock, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { useCoachGoals, useCoachGoalAction, useCoachees } from "@/lib/api/v1/hooks";

const CAT_COLORS: Record<string, string> = { Career:"bg-blue-50 text-blue-700", Personal:"bg-pink-50 text-pink-700", Skill:"bg-violet-50 text-violet-700", Health:"bg-emerald-50 text-emerald-700", Financial:"bg-amber-50 text-amber-700", Relationship:"bg-rose-50 text-rose-700", Leadership:"bg-indigo-50 text-indigo-700" };
const MOODS = [{ v: "excited", e: "🚀" }, { v: "confident", e: "💪" }, { v: "uncertain", e: "🤔" }, { v: "struggling", e: "😰" }, { v: "breakthrough", e: "⚡" }];
const CATEGORIES = ["Career","Personal","Skill","Health","Financial","Relationship","Leadership","Other"];

function CreateGoalModal({ onClose }: { onClose: () => void }) {
  const action = useCoachGoalAction();
  const { data } = useCoachees("active");
  const rels = data?.coachees ?? [];
  const [f, setF] = useState({ rel_id: "", title: "", description: "", why: "", success_looks_like: "", obstacles: "", category: "Career", target_date: "" });
  const [milestones, setMilestones] = useState([{ title: "", due_date: "" }]);
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const addMs = () => setMilestones(m => [...m, { title: "", due_date: "" }]);
  const setMs = (i: number, k: string, v: string) => setMilestones(m => m.map((ms, idx) => idx === i ? { ...ms, [k]: v } : ms));
  const rmMs  = (i: number) => setMilestones(m => m.filter((_, idx) => idx !== i));

  const handle = async () => {
    if (!f.rel_id || !f.title) return;
    await action.mutateAsync({ action: "create", ...f, rel_id: +f.rel_id, milestones: milestones.filter(m => m.title.trim()) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl max-h-[94vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 shrink-0">
          <h2 className="text-white font-bold text-xl">Set Coaching Goal</h2>
          <p className="text-emerald-100 text-sm">Goals with a clear WHY are achieved 3× more often</p>
        </div>
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Coachee *</label>
            <select value={f.rel_id} onChange={e => set("rel_id", e.target.value)} className="w-full border-2 border-gray-200 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
              <option value="">Select coachee...</option>
              {rels.map((r: any) => <option key={r.rel_id} value={r.rel_id}>{r.display_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Goal Title *</label>
            <input value={f.title} onChange={e => set("title", e.target.value)} className="w-full border-2 border-gray-200 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="e.g. Get promoted to Senior Manager within 6 months"/>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">🔥 WHY — The Deep Reason</label>
            <textarea value={f.why} onChange={e => set("why", e.target.value)} rows={2} className="w-full border-2 border-gray-200 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="Why does this goal truly matter to them at a deeper level?"/>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">✨ What Success Looks Like</label>
            <textarea value={f.success_looks_like} onChange={e => set("success_looks_like", e.target.value)} rows={2} className="w-full border-2 border-gray-200 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="What will be different in their life when this is achieved?"/>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">🚧 Anticipated Obstacles</label>
            <textarea value={f.obstacles} onChange={e => set("obstacles", e.target.value)} rows={2} className="w-full border-2 border-gray-200 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="What might get in the way? How will they overcome it?"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Category</label>
              <select value={f.category} onChange={e => set("category", e.target.value)} className="w-full border-2 border-gray-200 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Target Date</label>
              <input type="date" value={f.target_date} onChange={e => set("target_date", e.target.value)} className="w-full border-2 border-gray-200 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm outline-none"/>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Milestones</label>
              <button onClick={addMs} className="text-xs text-emerald-600 font-semibold hover:text-emerald-500 flex items-center gap-1"><Plus size={12}/>Add</button>
            </div>
            <div className="space-y-2">
              {milestones.map((ms, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={ms.title} onChange={e => setMs(i, "title", e.target.value)} className="flex-1 border-2 border-gray-200 focus:border-emerald-400 rounded-xl px-3 py-2 text-sm outline-none" placeholder={`Milestone ${i + 1}...`}/>
                  <input type="date" value={ms.due_date} onChange={e => setMs(i, "due_date", e.target.value)} className="w-36 border-2 border-gray-200 focus:border-emerald-400 rounded-xl px-3 py-2 text-sm outline-none"/>
                  {milestones.length > 1 && <button onClick={() => rmMs(i)} className="text-red-400 hover:text-red-600"><X size={16}/></button>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handle} disabled={action.isPending || !f.rel_id || !f.title} className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
            {action.isPending && <Loader2 size={14} className="animate-spin"/>}<Target size={15}/>Set Goal
          </button>
        </div>
      </div>
    </div>
  );
}

function UpdateModal({ goal, onClose }: { goal: any; onClose: () => void }) {
  const action = useCoachGoalAction();
  const [pct,    setPct]    = useState(goal.progress_pct);
  const [status, setStatus] = useState(goal.status);
  const [note,   setNote]   = useState("");
  const [mood,   setMood]   = useState("");
  const handle = async () => {
    await action.mutateAsync({ action: "update_progress", goal_id: goal.goal_id, progress_pct: pct, status, note: note || null, mood: mood || null });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Update Progress</h2>
        <p className="text-gray-500 text-sm mb-5">{goal.title}</p>
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold text-gray-700">Progress</span><span className="text-2xl font-bold text-emerald-600">{pct}%</span></div>
          <input type="range" min={0} max={100} value={pct} onChange={e => setPct(+e.target.value)} className="w-full accent-emerald-600"/>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mt-2"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }}/></div>
        </div>
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Status</label>
          <div className="grid grid-cols-2 gap-2">
            {["active", "achieved", "paused", "abandoned"].map(s => (
              <button key={s} onClick={() => setStatus(s)} className={`py-2 rounded-xl text-sm font-medium border-2 capitalize transition ${status === s ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-emerald-200"}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Coachee Mood</label>
          <div className="flex gap-2">
            {MOODS.map(m => <button key={m.v} onClick={() => setMood(m.v)} className={`flex-1 py-2 rounded-xl text-xl transition border-2 ${mood === m.v ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:border-emerald-200"}`}>{m.e}</button>)}
          </div>
        </div>
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-1 block">Progress Note</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="w-full border-2 border-gray-200 focus:border-emerald-400 rounded-xl p-3 text-sm resize-none outline-none" placeholder="What progress has been made? Any insights?"/>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handle} disabled={action.isPending} className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
            {action.isPending && <Loader2 size={14} className="animate-spin"/>}Update
          </button>
        </div>
      </div>
    </div>
  );
}

function GoalCard({ goal, onUpdate }: { goal: any; onUpdate: () => void }) {
  const action = useCoachGoalAction();
  const [exp, setExp] = useState(false);
  const isOverdue = goal.target_date && new Date(goal.target_date) < new Date() && goal.status === "active";
  return (
    <div className={`bg-white rounded-2xl border-2 p-5 transition-all ${goal.status === "achieved" ? "border-emerald-200 bg-emerald-50/30" : goal.status === "paused" ? "border-amber-200" : goal.status === "abandoned" ? "border-gray-200 opacity-60" : "border-gray-100 hover:border-emerald-200"}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {goal.category && <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${CAT_COLORS[goal.category] ?? "bg-gray-100 text-gray-600"}`}>{goal.category}</span>}
            {goal.status === "achieved" && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center gap-1"><CheckCircle size={9}/>Achieved!</span>}
            {isOverdue && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-semibold">Overdue</span>}
          </div>
          <h3 className="font-bold text-gray-900">{goal.title}</h3>
          <p className="text-sm text-gray-500">Coachee: {goal.coachee_name}</p>
        </div>
        {goal.target_date && <span className={`text-xs shrink-0 flex items-center gap-1 ${isOverdue ? "text-red-500 font-semibold" : "text-gray-400"}`}><Clock size={11}/>{new Date(goal.target_date).toLocaleDateString()}</span>}
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">Progress</span><span className="text-sm font-bold text-gray-900">{goal.progress_pct}%</span></div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${goal.status === "achieved" ? "bg-emerald-500" : goal.progress_pct >= 70 ? "bg-emerald-500" : goal.progress_pct >= 40 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${goal.progress_pct}%` }}/></div>
        {(goal.ms_done !== undefined && goal.ms_total > 0) && <p className="text-xs text-gray-400 mt-1">{goal.ms_done}/{goal.ms_total} milestones</p>}
      </div>
      {goal.milestones?.length > 0 && (
        <div className="mb-3">
          <button onClick={() => setExp(!exp)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-2">{exp ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}Milestones</button>
          {exp && <div className="space-y-1.5">{goal.milestones.map((ms: any) => (
            <div key={ms.milestone_id} className="flex items-center gap-2">
              <button onClick={() => !ms.is_completed && action.mutate({ action: "complete_milestone", milestone_id: ms.milestone_id })} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${ms.is_completed ? "bg-emerald-500 border-emerald-500" : "border-gray-300 hover:border-emerald-400"}`}>{ms.is_completed && <CheckCircle size={11} className="text-white"/>}</button>
              <span className={`text-sm flex-1 ${ms.is_completed ? "line-through text-gray-400" : "text-gray-700"}`}>{ms.title}</span>
              {ms.due_date && <span className="text-xs text-gray-400">{new Date(ms.due_date).toLocaleDateString()}</span>}
            </div>
          ))}</div>}
        </div>
      )}
      {goal.updates?.[0] && <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mb-3 italic text-xs">Latest: "{goal.updates[0].content}"</p>}
      {goal.status === "active" && <button onClick={onUpdate} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition"><TrendingUp size={14}/>Update Progress</button>}
    </div>
  );
}

export default function CoachGoalsPage() {
  const [filter, setFilter] = useState("active");
  const [showCreate, setShowCreate] = useState(false);
  const [updating,   setUpdating]   = useState<any>(null);
  const { data, isLoading } = useCoachGoals(filter && filter !== "all" ? { status: filter } : undefined);
  const goals = data?.goals ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-gray-900">Coaching Goals</h1><p className="text-gray-500 text-sm mt-0.5">Track meaningful outcomes for every coachee</p></div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition"><Plus size={16}/>Set Goal</button>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[{ l: "Total", v: goals.length, c: "text-gray-900" }, { l: "Active", v: goals.filter((g: any) => g.status === "active").length, c: "text-emerald-600" }, { l: "Achieved", v: goals.filter((g: any) => g.status === "achieved").length, c: "text-indigo-600" }, { l: "Avg Progress", v: goals.length ? `${Math.round(goals.reduce((s: number, g: any) => s + g.progress_pct, 0) / goals.length)}%` : "0%", c: "text-amber-600" }].map(s => (
            <div key={s.l} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm"><p className={`text-2xl font-bold ${s.c}`}>{s.v}</p><p className="text-xs text-gray-400 mt-0.5">{s.l}</p></div>
          ))}
        </div>
        <div className="flex gap-2 mb-6">
          {["all", "active", "achieved", "paused", "abandoned"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition ${filter === f ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-200"}`}>{f}</button>
          ))}
        </div>
        {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-emerald-400"/></div>
          : goals.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Target size={40} className="mx-auto mb-3 text-gray-200"/>
              <h3 className="text-lg font-bold text-gray-700 mb-1">No goals yet</h3>
              <p className="text-gray-400 text-sm mb-5">Goals give coaching direction and something powerful to work toward</p>
              <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-500 transition"><Plus size={14}/>Set First Goal</button>
            </div>
          ) : <div className="space-y-4">{goals.map((g: any) => <GoalCard key={g.goal_id} goal={g} onUpdate={() => setUpdating(g)}/>)}</div>}
      </div>
      {showCreate && <CreateGoalModal onClose={() => setShowCreate(false)}/>}
      {updating && <UpdateModal goal={updating} onClose={() => setUpdating(null)}/>}
    </div>
  );
}
