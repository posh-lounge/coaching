"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Users, Calendar, CheckSquare, Target, DollarSign, MessageCircle,
  TrendingUp, Clock, Star, ArrowRight, Plus, AlertCircle, Sparkles, Award
} from "lucide-react";
import { useCoachDashboard, useCoachSessionAction, useCoachTaskAction } from "@/lib/api/v1/hooks";

const fmt = (n: number) => `${Number(n || 0).toLocaleString()} RWF`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

function KpiCard({ label, value, sub, icon, color, href }: any) {
  const el = (
    <div className={`bg-white rounded-2xl border-2 p-5 hover:shadow-md transition-all group ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:scale-110 transition-transform flex items-center justify-center">{icon}</div>
        {href && <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors"/>}
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{el}</Link> : el;
}

export default function CoachDashboard() {
  const { data, isLoading } = useCoachDashboard();
  const sessionAction = useCoachSessionAction();
  const taskAction    = useCoachTaskAction();

  const d = data ?? {};
  const coachees       = d.coachees           ?? [];
  const upcoming       = d.upcoming_sessions  ?? [];
  const toReview       = d.tasks_to_review    ?? [];
  const toApprove      = d.tasks_to_approve   ?? [];
  const goals          = d.active_goals       ?? [];
  const notifs         = d.notifications      ?? [];
  const myMentors      = d.my_mentors         ?? [];

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
        <p className="text-gray-400 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Good morning, Coach 👋</h1>
            <p className="text-gray-500 text-sm mt-0.5">Here's what's happening with your coaching practice today.</p>
          </div>
          <div className="flex items-center gap-3">
            {d.is_dual_role && (
              <Link href="/coach/dual" className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-700 border border-violet-200 rounded-xl text-sm font-semibold hover:bg-violet-100 transition">
                <Sparkles size={14}/>Dual View
              </Link>
            )}
            <Link href="/coach/sessions" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition">
              <Plus size={16}/>Schedule Session
            </Link>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <KpiCard href="/coach/coachees" label="Active Coachees"  value={d.total_coachees??0}      icon={<Users size={20} className="text-indigo-500"/>}   color="border-indigo-100" sub={`${coachees.filter((c:any)=>c.unread>0).length} unread messages`}/>
          <KpiCard href="/coach/sessions" label="Sessions This Month" value={d.sessions_month??0}   icon={<Calendar size={20} className="text-blue-500"/>}   color="border-blue-100" sub="Completed"/>
          <KpiCard href="/coach/tasks"    label="Tasks to Review"  value={toReview.length}          icon={<CheckSquare size={20} className="text-violet-500"/>} color={`border-${toReview.length>0?"violet":"gray"}-${toReview.length>0?"300":"100"}`} sub={`${toApprove.length} proposals waiting`}/>
          <KpiCard href="/coach/earnings" label="Earnings This Month" value={fmt(d.earnings_month)}  icon={<DollarSign size={20} className="text-emerald-500"/>} color="border-emerald-100" sub={`${fmt(d.available_balance)} available`}/>
          <KpiCard href="/coach/messages" label="Unread Messages"  value={d.unread_messages??0}     icon={<MessageCircle size={20} className="text-amber-500"/>} color={`border-${(d.unread_messages??0)>0?"amber":"gray"}-${(d.unread_messages??0)>0?"300":"100"}`}/>
        </div>

        <div className="grid grid-cols-3 gap-4">

          {/* Upcoming sessions */}
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><Calendar size={16} className="text-indigo-500"/>Upcoming Sessions</h2>
              <Link href="/coach/sessions" className="text-xs text-indigo-600 font-semibold hover:text-indigo-500">View all →</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={32} className="mx-auto mb-2 text-gray-200"/>
                <p className="text-gray-400 text-sm">No upcoming sessions</p>
                <Link href="/coach/sessions" className="text-indigo-600 text-xs font-semibold mt-1 inline-block">Schedule one →</Link>
              </div>
            ) : upcoming.map((s: any) => (
              <div key={s.session_id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 group">
                <div className="w-10 h-10 rounded-full bg-indigo-50 overflow-hidden shrink-0">
                  {s.coachee_photo ? <img src={s.coachee_photo} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-sm">{s.coachee_name?.[0]}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{s.title}</p>
                  <p className="text-xs text-gray-400">{s.coachee_name} · {s.session_type === "online" ? "🔗 Online" : "📍 In-person"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{fmtTime(s.scheduled_at)}</p>
                  <p className="text-xs text-gray-400">{fmtDate(s.scheduled_at)}</p>
                </div>
                {s.status === "scheduled" && (
                  <button onClick={() => sessionAction.mutate({ action: "confirm", session_id: s.session_id })}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition shrink-0">
                    Confirm
                  </button>
                )}
                {s.meeting_link && s.status === "confirmed" && (
                  <a href={s.meeting_link} target="_blank" className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 transition shrink-0">
                    Join
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Tasks to review */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><CheckSquare size={16} className="text-violet-500"/>Need Review</h2>
              <Link href="/coach/tasks" className="text-xs text-indigo-600 font-semibold hover:text-indigo-500">All →</Link>
            </div>
            {toReview.length === 0 && toApprove.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare size={28} className="mx-auto mb-2 text-gray-200"/>
                <p className="text-gray-400 text-sm">All caught up!</p>
              </div>
            ) : (
              <>
                {toReview.slice(0, 4).map((t: any) => (
                  <div key={t.task_id} className="py-2.5 border-b border-gray-50 last:border-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{t.title}</p>
                    <p className="text-xs text-gray-400">{t.coachee_name}</p>
                    <div className="flex gap-2 mt-1.5">
                      <button onClick={() => taskAction.mutate({ action: "review", task_id: t.task_id, rating: 5 })}
                        className="flex-1 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 hover:bg-emerald-100 transition">
                        Review
                      </button>
                    </div>
                  </div>
                ))}
                {toApprove.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-amber-600 mb-1.5 flex items-center gap-1"><AlertCircle size={11}/>{toApprove.length} task proposal{toApprove.length > 1 ? "s" : ""}</p>
                    {toApprove.slice(0, 2).map((t: any) => (
                      <div key={t.task_id} className="flex items-center gap-2 py-1.5">
                        <p className="text-xs text-gray-700 flex-1 truncate">{t.title}</p>
                        <button onClick={() => taskAction.mutate({ action: "approve", task_id: t.task_id })} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg font-semibold hover:bg-emerald-100 transition">✓</button>
                        <button onClick={() => taskAction.mutate({ action: "reject", task_id: t.task_id })} className="text-xs px-2 py-0.5 bg-red-50 text-red-500 rounded-lg font-semibold hover:bg-red-100 transition">✗</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Active coachees */}
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><Users size={16} className="text-indigo-500"/>Your Coachees</h2>
              <Link href="/coach/coachees" className="text-xs text-indigo-600 font-semibold hover:text-indigo-500">View all →</Link>
            </div>
            {coachees.length === 0 ? (
              <div className="text-center py-8">
                <Users size={32} className="mx-auto mb-2 text-gray-200"/>
                <p className="text-gray-400 text-sm">No active coachees yet</p>
                <p className="text-gray-300 text-xs mt-1">Approve your application to show up on the marketplace</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {coachees.slice(0, 6).map((c: any) => (
                  <Link key={c.rel_id} href={`/coach/coachees?rel=${c.rel_id}`} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition group">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-indigo-100">
                      {c.profile_photo ? <img src={c.profile_photo} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-sm">{c.display_name?.[0]}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.display_name}</p>
                      <p className="text-xs text-gray-400">{c.sessions_remaining} sessions left</p>
                    </div>
                    {c.unread > 0 && <span className="w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">{c.unread}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Active goals + dual role */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2"><Target size={16} className="text-indigo-500"/>Active Goals</h2>
                <Link href="/coach/goals" className="text-xs text-indigo-600 font-semibold">All →</Link>
              </div>
              {goals.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">No active goals</p> : goals.slice(0, 4).map((g: any) => (
                <div key={g.goal_id} className="py-2.5 border-b border-gray-50 last:border-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{g.title}</p>
                  <p className="text-xs text-gray-400 mb-1.5">{g.coachee_name}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${g.progress_pct}%` }}/>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 text-right">{g.progress_pct}%</p>
                </div>
              ))}
            </div>

            {/* If dual role, show mentors */}
            {myMentors.length > 0 && (
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-200 p-5">
                <h2 className="font-bold text-violet-900 flex items-center gap-2 mb-3"><Award size={16} className="text-violet-600"/>My Mentors</h2>
                {myMentors.map((m: any) => (
                  <div key={m.rel_id} className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-violet-100 shrink-0">
                      {m.profile_photo ? <img src={m.profile_photo} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-violet-600 font-bold text-sm">{m.display_name?.[0]}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-violet-900 truncate">{m.display_name}</p>
                      <p className="text-xs text-violet-400">{m.sessions_remaining} sessions remaining</p>
                    </div>
                  </div>
                ))}
                <Link href="/coach/dual" className="mt-3 text-xs text-violet-700 font-semibold hover:text-violet-500 flex items-center gap-1">View as Coachee <ArrowRight size={11}/></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
