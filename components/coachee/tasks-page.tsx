"use client";
import React, { useState } from "react";
import { CheckSquare, Plus, X, Loader2, Clock, ChevronDown, ChevronUp, Star } from "lucide-react";
import { useCoacheeTasks, useCoacheeTaskAction } from "@/lib/api/v1/hooks";

const PRIORITY_COLORS: Record<string,string> = { critical:"bg-red-50 text-red-700 border-red-200", high:"bg-orange-50 text-orange-700 border-orange-200", medium:"bg-amber-50 text-amber-700 border-amber-200", low:"bg-gray-100 text-gray-600 border-gray-200" };
const STATUS_STYLES: Record<string,string> = { pending_approval:"bg-amber-50 text-amber-700", approved:"bg-blue-50 text-blue-700", in_progress:"bg-violet-50 text-violet-700", submitted:"bg-indigo-50 text-indigo-700", reviewed:"bg-emerald-50 text-emerald-700", rejected:"bg-red-50 text-red-500" };

function ProposeModal({ onClose }: { onClose: () => void }) {
  const action = useCoacheeTaskAction();
  const [f, setF] = useState({ rel_id:"", title:"", description:"", why:"", due_date:"", priority:"medium" });
  const set = (k: string, v: string) => setF(p => ({...p,[k]:v}));
  const handle = async () => {
    if (!f.rel_id || !f.title) return;
    await action.mutateAsync({ action:"propose", ...f, rel_id:+f.rel_id });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5">
          <h2 className="text-white font-bold text-xl">Propose a Task</h2>
          <p className="text-violet-200 text-sm">Your coach will review and approve it</p>
        </div>
        <div className="p-6 space-y-4">
          <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Relationship ID</label><input value={f.rel_id} onChange={e => set("rel_id",e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="Your rel_id"/></div>
          <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Task Title *</label><input value={f.title} onChange={e => set("title",e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="e.g. Practice public speaking for 10 minutes a day"/></div>
          <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Why is this important to you?</label><textarea value={f.why} onChange={e => set("why",e.target.value)} rows={2} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="What made you think of this task?"/></div>
          <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Details</label><textarea value={f.description} onChange={e => set("description",e.target.value)} rows={2} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="More details about what you plan to do..."/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Due Date</label><input type="date" value={f.due_date} onChange={e => set("due_date",e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none"/></div>
            <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Priority</label><select value={f.priority} onChange={e => set("priority",e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">{["low","medium","high","critical"].map(p=><option key={p} value={p}>{p}</option>)}</select></div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handle} disabled={action.isPending||!f.rel_id||!f.title} className="flex-1 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
            {action.isPending&&<Loader2 size={14} className="animate-spin"/>}Propose
          </button>
        </div>
      </div>
    </div>
  );
}

function SubmitModal({ task, onClose }: { task: any; onClose: () => void }) {
  const action = useCoacheeTaskAction();
  const [content, setContent]       = useState("");
  const [reflection, setReflection] = useState("");
  const handle = async () => {
    if (!content.trim()) return;
    await action.mutateAsync({ action:"submit", task_id:task.task_id, content, reflection });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Submit Task</h2>
        <p className="text-gray-500 text-sm mb-4">{task.title}</p>
        {task.why && <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4"><p className="text-xs font-semibold text-amber-700 mb-0.5">🔥 Why this matters</p><p className="text-sm text-amber-900">{task.why}</p></div>}
        {task.success_criteria && <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-4"><p className="text-xs font-semibold text-indigo-700 mb-0.5">✓ Success criteria</p><p className="text-sm text-indigo-900">{task.success_criteria}</p></div>}
        <div className="mb-4"><label className="text-sm font-semibold text-gray-700 mb-1 block">What did you do? *</label><textarea value={content} onChange={e => setContent(e.target.value)} rows={4} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl p-3 text-sm resize-none outline-none" placeholder="Describe what you did and the results..."/></div>
        <div className="mb-5"><label className="text-sm font-semibold text-gray-700 mb-1 block">Your Reflection</label><textarea value={reflection} onChange={e => setReflection(e.target.value)} rows={3} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl p-3 text-sm resize-none outline-none" placeholder="What did you learn? What was hard? What surprised you?"/></div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handle} disabled={action.isPending||!content.trim()} className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
            {action.isPending&&<Loader2 size={14} className="animate-spin"/>}Submit
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: any }) {
  const action = useCoacheeTaskAction();
  const [exp, setExp]         = useState(false);
  const [submitting, setSubm] = useState(false);
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !["reviewed","rejected"].includes(task.status);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-violet-200 transition shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <h3 className="font-bold text-gray-900">{task.title}</h3>
                <p className="text-sm text-gray-500">{task.coach_name}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLES[task.status]??""}`}>{task.status.replace("_"," ")}</span>
              </div>
            </div>
            {task.due_date && <p className={`text-xs flex items-center gap-1 mb-2 ${isOverdue?"text-red-500 font-semibold":"text-gray-400"}`}><Clock size={10}/>{isOverdue?"Overdue: ":"Due: "}{new Date(task.due_date).toLocaleDateString()}</p>}
            {task.description && <><button onClick={() => setExp(!exp)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2">{exp?<ChevronUp size={11}/>:<ChevronDown size={11}/>}Details</button>{exp&&<p className="text-sm text-gray-600 mb-2">{task.description}</p>}</>}
            {exp && task.why && <div className="p-3 bg-amber-50 rounded-xl mb-2"><p className="text-xs font-semibold text-amber-700 mb-0.5">🔥 Why this matters</p><p className="text-sm text-amber-900">{task.why}</p></div>}
            {/* Feedback */}
            {task.coach_feedback && (
              <div className="p-3 bg-emerald-50 rounded-xl mb-2">
                <p className="text-xs font-semibold text-emerald-700 mb-0.5 flex items-center gap-1">
                  <Star size={11}/> Coach Feedback {task.coach_rating && `— ${task.coach_rating}/5 ⭐`}
                </p>
                <p className="text-sm text-emerald-900">{task.coach_feedback}</p>
              </div>
            )}
            {task.reject_reason && <div className="p-3 bg-red-50 rounded-xl mb-2"><p className="text-xs font-semibold text-red-600 mb-0.5">Feedback</p><p className="text-sm text-red-800">{task.reject_reason}</p></div>}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
          {task.status === "approved" && <button onClick={() => action.mutate({ action:"start", task_id:task.task_id })} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition">Start Task</button>}
          {task.status === "in_progress" && <button onClick={() => setSubm(true)} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-500 transition flex items-center gap-1.5"><CheckSquare size={12}/>Submit</button>}
          {task.status === "pending_approval" && <p className="text-xs text-amber-600 italic">Waiting for coach approval...</p>}
          {task.status === "submitted"        && <p className="text-xs text-indigo-600 italic">Submitted — waiting for review...</p>}
        </div>
      </div>
      {submitting && <SubmitModal task={task} onClose={() => setSubm(false)}/>}
    </>
  );
}

export default function CoacheeTasksPage() {
  const [filter, setFilter] = useState("");
  const [showPropose, setShowPropose] = useState(false);
  const { data, isLoading } = useCoacheeTasks(filter ? { status: filter } : undefined);
  const tasks = data?.tasks ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-gray-900">My Tasks</h1><p className="text-gray-500 text-sm mt-0.5">{tasks.length} tasks</p></div>
          <button onClick={() => setShowPropose(true)} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition"><Plus size={16}/>Propose Task</button>
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {[{v:"",l:"All"},{v:"approved",l:"To Start"},{v:"in_progress",l:"In Progress"},{v:"submitted",l:"Submitted"},{v:"reviewed",l:"Reviewed"},{v:"pending_approval",l:"Pending Approval"}].map(f=>(
            <button key={f.v} onClick={() => setFilter(f.v)} className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${filter===f.v?"bg-violet-600 text-white":"bg-white border border-gray-200 text-gray-600 hover:border-violet-200"}`}>{f.l}</button>
          ))}
        </div>
        {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-violet-400"/></div>
          : tasks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <CheckSquare size={40} className="mx-auto mb-3 text-gray-200"/>
              <h3 className="text-lg font-bold text-gray-700 mb-1">No tasks yet</h3>
              <p className="text-gray-400 text-sm mb-5">Your coach will assign tasks, or you can propose your own</p>
              <button onClick={() => setShowPropose(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-500 transition"><Plus size={14}/>Propose a Task</button>
            </div>
          ) : <div className="space-y-3">{tasks.map((t: any) => <TaskCard key={t.task_id} task={t}/>)}</div>}
      </div>
      {showPropose && <ProposeModal onClose={() => setShowPropose(false)}/>}
    </div>
  );
}
