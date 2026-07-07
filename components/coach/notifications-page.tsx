"use client";
import React from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useCoachNotifications, useMarkCoachNotifsRead } from "@/lib/api/v1/hooks";

const TYPE_ICONS: Record<string, string> = {
  session_created: "📅", session_confirmed: "✅", session_completed: "🏁", session_cancelled: "❌",
  task_submitted: "📤", task_reviewed: "⭐", task_assigned: "📋", task_approved: "✓", task_rejected: "✗",
  goal_created: "🎯", goal_achieved: "🎉", goal_updated: "📈",
  message_received: "💬", payment_confirmed: "💰", resource_shared: "📚",
  coach_approved: "🎉", review_received: "⭐", payout_completed: "💸", payout_rejected: "⚠️",
};

export default function CoachNotificationsPage() {
  const { data, isLoading } = useCoachNotifications();
  const markRead = useMarkCoachNotifsRead();
  const notifs  = data?.notifications ?? [];
  const unread  = data?.unread_count  ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Bell size={22} className="text-indigo-500"/>Notifications</h1>
            {unread > 0 && <p className="text-indigo-600 text-sm font-medium mt-0.5">{unread} unread</p>}
          </div>
          {unread > 0 && (
            <button onClick={() => markRead.mutate()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
              <CheckCheck size={14}/>Mark all read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Bell size={40} className="mx-auto mb-3 text-gray-200"/>
            <h3 className="text-lg font-bold text-gray-700">All caught up!</h3>
            <p className="text-gray-400 text-sm mt-1">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.map((n: any) => (
              <div key={n.notif_id} className={`bg-white rounded-2xl border p-4 flex items-start gap-4 transition ${n.is_read ? "border-gray-100" : "border-indigo-200 bg-indigo-50/40"}`}>
                <span className="text-2xl shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                  {n.body && <p className="text-gray-500 text-sm mt-0.5">{n.body}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                {!n.is_read && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 mt-1.5"/>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
