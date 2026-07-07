"use client";
import React, { useState } from "react";
import { CheckSquare, Plus, X, Loader2, Star, Flag, Clock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useCoachTasks, useCoachTaskAction, useCoachees, useCoachGoals } from "@/lib/api/v1/hooks";

const PRIORITY_COLORS: Record<string, string> = { critical: "bg-red-50 text-red-700 border-red-200", high: "bg-orange-50 text-orange-700 border-orange-200", medium: "bg-amber-50 text-amber-700 border-amber-200", low: "bg-gray-100 text-gray-600 border-gray-200" };
const STATUS_COLORS: Record<string, string> = { pending_approval: "bg-amber-50 text-amber-700", approved: "bg-blue-50 text-blue-700", in_progress: "bg-violet-50 text-violet-700", submitted: "bg-indigo-50 text-indigo-700 font-bold", reviewed: "bg-emerald-50 text-emerald-700", rejected: "bg-red-50 text-red-500" };

function CreateTaskModal({ onClose }: { onClose: () => void }) {
  const action = useCoachTaskAction();
  const { data: coacheeData } = useCoachees("active");
  const [relId, setRelId] = useState("");
  const { data: goalsData } = useCoachGoals(relId ? { rel_id: +relId } : undefined);
  const rels  = coacheeData?.coachees ?? [];
  const goals = goalsData?.goals?.filter((g: any) => g.status === "active") ?? [];
  const [f, setF] = useState({ title: "", description: "", why: "", success_criteria: "", due_date: "", priority: "medium", linked_goal_id: "" });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const handle = async () => {
    if (!relId || !f.title) return;
    await action.mutateAsync({ action: "create", rel_id: +relId, ...f, linked_goal_id: f.linked_goal_id ? +f.linked_goal_id : null });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5 shrink-0">
          <h2 className="text-white font-bold text-xl">Assign Task</h2>
          <p className="text-violet-200 text-sm mt-0.5">Give your coachee meaningful work to do</p>
        </div>
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Coachee *</label>
            <select value={relId} onChange={e => setRelId(e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
              <option value="">Select coachee...</option>
              {rels.map((r: any) => <option key={r.rel_id} value={r.rel_id}>{r.display_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Task Title *</label>
            <input value={f.title} onChange={e => set("title", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="e.g. Write your personal mission statement"/>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Description</label>
            <textarea value={f.description} onChange={e => set("description", e.target.value)} rows={3} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="What exactly should they do?"/>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">🔥 Why This Matters</label>
            <textarea value={f.why} onChange={e => set("why", e.target.value)} rows={2} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="How does this connect to their bigger goals?"/>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Success Criteria</label>
            <textarea value={f.success_criteria} onChange={e => set("success_criteria", e.target.value)} rows={2} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="How will you both know this is done well?"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Due Date</label>
              <input type="date" value={f.due_date} onChange={e => set("due_date", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none"/>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Priority</label>
              <select value={f.priority} onChange={e => set("priority", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white capitalize">
                {["low", "medium", "high", "critical"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          {goals.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Link to Goal (optional)</label>
              <select value={f.linked_goal_id} onChange={e => set("linked_goal_id", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
                <option value="">No linked goal</option>
                {goals.map((g: any) => <option key={g.goal_id} value={g.goal_id}>{g.title}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handle} disabled={action.isPending || !relId || !f.title} className="flex-1 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
            {action.isPending && <Loader2 size={14} className="animate-spin"/>}<CheckSquare size={15}/>Assign Task
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ task, onClose }: { task: any; onClose: () => void }) {
  const action = useCoachTaskAction();
  const [feedback, setFeedback] = useState("");
  const [rating,   setRating]   = useState(5);
  const handle = async () => {
    await action.mutateAsync({ action: "review", task_id: task.task_id, feedback, rating });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Review Submission</h2>
        <p className="text-gray-500 text-sm mb-4">{task.title} · {task.coachee_name}</p>
        {task.latest_submission && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-4">
            <p className="text-xs font-semibold text-indigo-600 mb-1">Coachee's Submission</p>
            <p className="text-sm text-gray-700">{task.latest_submission}</p>
            {task.latest_reflection && <><p className="text-xs font-semibold text-indigo-600 mt-3 mb-1">Their Reflection</p><p className="text-sm text-gray-600 italic">"{task.latest_reflection}"</p></>}
          </div>
        )}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setRating(s)} className={`w-10 h-10 rounded-xl text-lg transition ${s <= rating ? "bg-amber-400 text-white shadow-sm" : "bg-gray-100 text-gray-400 hover:bg-amber-50"}`}>★</button>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <label className="text-sm font-semibold text-gray-700 mb-1 block">Feedback</label>
          <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={4} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl p-3 text-sm resize-none outline-none" placeholder="What did they do well? What can improve? What's the impact?"/>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handle} disabled={action.isPending} className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
            {action.isPending && <Loader2 size={14} className="animate-spin"/>}Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, action }: { task: any; action: any }) {
  const [expanded, setExpanded] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !["reviewed", "rejected"].includes(task.status);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 transition shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-violet-50 shrink-0 overflow-hidden">
            {task.coachee_photo ? <img src={task.coachee_photo} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-violet-600 font-bold text-sm">{task.coachee_name?.[0]}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <h3 className="font-bold text-gray-900">{task.title}</h3>
                <p className="text-sm text-gray-500">{task.coachee_name} {task.created_by_role === "coachee" && <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full ml-1">Proposed</span>}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLORS[task.status] ?? "bg-gray-100 text-gray-600"}`}>{task.status.replace("_", " ")}</span>
              </div>
            </div>
            {task.due_date && <p className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-500 font-semibold" : "text-gray-400"}`}><Clock size={10}/>{isOverdue ? "Overdue: " : "Due: "}{new Date(task.due_date).toLocaleDateString()}</p>}
            {task.description && (
              <div>
                <button onClick={() => setExpanded(!expanded)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mt-1">{expanded ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}Details</button>
                {expanded && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{task.description}</p>}
                {expanded && task.why && <div className="mt-2 p-3 bg-amber-50 rounded-xl"><p className="text-xs font-semibold text-amber-700 mb-0.5">🔥 Why this matters</p><p className="text-sm text-amber-900">{task.why}</p></div>}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
          {task.status === "pending_approval" && task.created_by_role === "coachee" && (
            <>
              <button onClick={() => action.mutate({ action: "approve", task_id: task.task_id })} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 transition">✓ Approve</button>
              <button onClick={() => action.mutate({ action: "reject", task_id: task.task_id, reason: "Not aligned with current goals" })} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 rounded-xl text-xs font-semibold border border-red-200 hover:bg-red-100 transition">✗ Reject</button>
            </>
          )}
          {task.status === "submitted" && (
            <button onClick={() => setReviewing(true)} className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition">
              <Star size={12}/>Review Submission
            </button>
          )}
        </div>
      </div>
      {reviewing && <ReviewModal task={task} onClose={() => setReviewing(false)}/>}
    </>
  );
}

export default function CoachTasksPage() {
  const [filter,     setFilter]     = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useCoachTasks(filter ? { status: filter } : undefined);
  const action = useCoachTaskAction();
  const tasks = data?.tasks ?? [];

  const submitted  = tasks.filter((t: any) => t.status === "submitted").length;
  const toApprove  = tasks.filter((t: any) => t.status === "pending_approval" && t.created_by_role === "coachee").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-500 text-sm mt-0.5">{submitted > 0 && `${submitted} awaiting review · `}{toApprove > 0 && `${toApprove} proposals · `}{tasks.length} total</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition"><Plus size={16}/>Assign Task</button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {[{ v: "", l: "All" }, { v: "pending_approval", l: `Proposals${toApprove > 0 ? ` (${toApprove})` : ""}` }, { v: "approved", l: "Approved" }, { v: "in_progress", l: "In Progress" }, { v: "submitted", l: `To Review${submitted > 0 ? ` (${submitted})` : ""}` }, { v: "reviewed", l: "Reviewed" }].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)} className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${filter === f.v ? "bg-violet-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-violet-200"}`}>{f.l}</button>
          ))}
        </div>

        {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-violet-400"/></div>
          : tasks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <CheckSquare size={40} className="mx-auto mb-3 text-gray-200"/>
              <h3 className="text-lg font-bold text-gray-700 mb-1">No tasks</h3>
              <p className="text-gray-400 text-sm mb-5">Assign meaningful tasks to keep coachees growing between sessions</p>
              <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-500 transition"><Plus size={14}/>Assign First Task</button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((t: any) => <TaskCard key={t.task_id} task={t} action={action}/>)}
            </div>
          )}
      </div>
      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)}/>}
    </div>
  );
}
