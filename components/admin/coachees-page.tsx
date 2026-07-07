"use client";
import React, { useState } from "react";
import { Search, Shield, Star, Sparkles, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAdminCoachees,  useAdminAction, useAdminCoachAction } from "@/lib/api/v1/hooks";

const fmt = (n: number) => `${Number(n || 0).toLocaleString()} RWF`;

// ─── COACHES PAGE ─────────────────────────────────────────────
export default function AdminCoacheesPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminCoachees({ search });
  const coachees = data?.coachees ?? [];
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Coachees</h1><p className="text-gray-500 text-sm">{coachees.length} registered coachees</p></div>
        <div className="relative mb-6 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coachees..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-400 bg-white"/>
        </div>
        {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400"/></div>
        : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 text-left text-xs text-gray-400"><th className="p-4">Coachee</th><th className="p-4">Email</th><th className="p-4">Coaches</th><th className="p-4">Sessions</th><th className="p-4">Tasks</th><th className="p-4">Joined</th></tr></thead>
              <tbody>
                {coachees.map((c: any) => (
                  <tr key={c.coachee_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm shrink-0 overflow-hidden">{c.profile_photo?<img src={c.profile_photo} alt="" className="w-full h-full object-cover"/>:c.display_name?.[0]}</div>
                        <div><p className="font-medium text-gray-900">{c.display_name}</p>{c.occupation&&<p className="text-xs text-gray-400">{c.occupation}</p>}</div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500">{c.email}</td>
                    <td className="p-4 text-gray-700 font-medium">{c.total_coaches}</td>
                    <td className="p-4 text-gray-700">{c.total_sessions}</td>
                    <td className="p-4 text-gray-700">{c.tasks_done}</td>
                    <td className="p-4 text-gray-400 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}