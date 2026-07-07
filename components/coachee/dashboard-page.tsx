"use client";
import React from "react";
import Link from "next/link";
import { Calendar, CheckSquare, Target, MessageCircle, ArrowRight, Sparkles, Award, TrendingUp, Clock } from "lucide-react";
import { useCoacheeDashboard } from "@/lib/api/v1/hooks";

function StatCard({ label, value, icon, color, href }: any) {
  const el = (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition group">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:scale-110 transition-transform flex items-center justify-center">{icon}</div>
        {href && <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition"/>}
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{el}</Link> : el;
}

const MOOD_LABELS: Record<number, string> = { 1: "😔 Exhausted", 2: "😐 Okay", 3: "🙂 Good", 4: "😊 Energized", 5: "🤩 Transformed" };

export default function CoacheeDashboard() {
  const { data, isLoading } = useCoacheeDashboard();
  const d = data ?? {};
  const coaches      = d.my_coaches        ?? [];
  const upcoming     = d.upcoming_sessions ?? [];
  const tasks        = d.active_tasks      ?? [];
  const goals        = d.active_goals      ?? [];
  const stats        = d.stats             ?? {};
  const badges       = d.badges            ?? [];

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
        <p className="text-gray-400 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  );

  const hasCoach = coaches.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Your Coaching Journey 🌱</h1>
            <p className="text-gray-500 text-sm mt-0.5">Every great life was built one intentional step at a time.</p>
          </div>
          {!hasCoach && (
            <Link href="/coaching" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition">
              <Sparkles size={16}/>Find a Coach
            </Link>
          )}
        </div>

        {/* CTA if no coach yet */}
        {!hasCoach && (
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 mb-6 text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-white text-2xl font-extrabold mb-2">Start Your Transformation</h2>
            <p className="text-indigo-200 text-sm mb-6 max-w-md mx-auto">You're one coach away from becoming the person you were always meant to be. Browse coaches who specialize in exactly what you need.</p>
            <Link href="/coaching" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold hover:bg-indigo-50 transition"><Sparkles size={16}/>Browse Coaches</Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard href="/coachee/sessions" label="Sessions Done"   value={stats.sessions_completed ?? 0} icon={<Calendar size={20} className="text-indigo-500"/>}/>
          <StatCard href="/coachee/tasks"    label="Tasks Completed" value={stats.tasks_done          ?? 0} icon={<CheckSquare size={20} className="text-violet-500"/>}/>
          <StatCard href="/coachee/goals"    label="Goals Achieved"  value={stats.goals_achieved      ?? 0} icon={<Target size={20} className="text-emerald-500"/>}/>
          <StatCard href="/coachee/sessions" label="This Month"      value={stats.sessions_this_month ?? 0} icon={<TrendingUp size={20} className="text-amber-500"/>} sub="sessions"/>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Upcoming sessions */}
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><Calendar size={16} className="text-indigo-500"/>Upcoming Sessions</h2>
              <Link href="/coachee/sessions" className="text-xs text-indigo-600 font-semibold hover:text-indigo-500">View all →</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={28} className="mx-auto mb-2 text-gray-200"/>
                <p className="text-gray-400 text-sm">No upcoming sessions</p>
                {hasCoach && <Link href="/coachee/sessions" className="text-indigo-600 text-xs font-semibold mt-1 inline-block">Request a session →</Link>}
              </div>
            ) : upcoming.map((s: any) => (
              <div key={s.session_id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-50 shrink-0">
                  {s.coach_photo ? <img src={s.coach_photo} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-sm">{s.coach_name?.[0]}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{s.title}</p>
                  <p className="text-xs text-gray-400">{s.coach_name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{new Date(s.scheduled_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                  <p className="text-xs text-gray-400">{new Date(s.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
                {s.meeting_link && <a href={s.meeting_link} target="_blank" className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 transition shrink-0">Join</a>}
              </div>
            ))}
          </div>

          {/* My coaches */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><Sparkles size={16} className="text-violet-500"/>My Coaches</h2>
              <Link href="/coachee/my-coaches" className="text-xs text-indigo-600 font-semibold hover:text-indigo-500">All →</Link>
            </div>
            {coaches.length === 0 ? (
              <div className="text-center py-6">
                <Sparkles size={28} className="mx-auto mb-2 text-gray-200"/>
                <p className="text-gray-400 text-sm">No coaches yet</p>
              </div>
            ) : coaches.map((c: any) => (
              <div key={c.rel_id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-50 shrink-0">
                  {c.profile_photo ? <img src={c.profile_photo} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-sm">{c.display_name?.[0]}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.display_name}</p>
                  <p className="text-xs text-gray-400">{c.sessions_remaining} sessions left</p>
                </div>
                <Link href={`/coachee/messages?rel=${c.rel_id}`} className="relative"><MessageCircle size={18} className="text-gray-400 hover:text-indigo-600 transition"/>{c.unread > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center">{c.unread}</span>}</Link>
              </div>
            ))}
          </div>

          {/* Active tasks */}
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><CheckSquare size={16} className="text-violet-500"/>Active Tasks</h2>
              <Link href="/coachee/tasks" className="text-xs text-indigo-600 font-semibold hover:text-indigo-500">View all →</Link>
            </div>
            {tasks.length === 0 ? (
              <div className="text-center py-8"><CheckSquare size={28} className="mx-auto mb-2 text-gray-200"/><p className="text-gray-400 text-sm">No active tasks</p></div>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 4).map((t: any) => (
                  <div key={t.task_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${t.priority === "critical" ? "bg-red-500" : t.priority === "high" ? "bg-orange-400" : t.priority === "medium" ? "bg-amber-400" : "bg-gray-300"}`}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                      <p className="text-xs text-gray-400">{t.coach_name}</p>
                    </div>
                    {t.due_date && <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1"><Clock size={10}/>{new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 capitalize ${t.status === "in_progress" ? "bg-violet-50 text-violet-700" : t.status === "approved" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>{t.status.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goals + badges */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2"><Target size={16} className="text-emerald-500"/>My Goals</h2>
                <Link href="/coachee/goals" className="text-xs text-indigo-600 font-semibold">All →</Link>
              </div>
              {goals.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">No active goals</p> : goals.slice(0, 3).map((g: any) => (
                <div key={g.goal_id} className="py-2.5 border-b border-gray-50 last:border-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{g.title}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${g.progress_pct}%` }}/></div>
                  <p className="text-[10px] text-gray-400 mt-0.5 text-right">{g.progress_pct}%</p>
                </div>
              ))}
            </div>

            {badges.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5">
                <h2 className="font-bold text-amber-900 flex items-center gap-2 mb-3"><Award size={16} className="text-amber-500"/>Your Badges</h2>
                <div className="flex flex-wrap gap-1.5">
                  {badges.map((b: any) => <span key={b.badge_id} title={b.description} className="text-2xl cursor-default">{b.icon}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
