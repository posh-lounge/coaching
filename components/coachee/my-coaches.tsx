"use client";
import React, { useState } from "react";
import Link from "next/link";
import {  BookOpen, File, FileText, Video, Music, Link as LinkIcon, Download, Loader2, Star, Calendar, MessageCircle, BarChart2, Bell, CheckCheck, Target, CheckSquare } from "lucide-react";
import {  useCoacheeRelationships } from "@/lib/api/v1/hooks";


const TYPE_ICONS: Record<string, React.ReactNode> = { document:<FileText size={18} className="text-blue-500"/>, video:<Video size={18} className="text-red-500"/>, link:<LinkIcon size={18} className="text-indigo-500"/>, template:<File size={18} className="text-amber-500"/>, worksheet:<FileText size={18} className="text-emerald-500"/>, audio:<Music size={18} className="text-violet-500"/>, book:<BookOpen size={18} className="text-orange-500"/>, podcast:<Music size={18} className="text-pink-500"/> };


// ─── MY COACHES PAGE ──────────────────────────────────────────
export default function CoacheeMyCoachesPage() {
  const { data, isLoading } = useCoacheeRelationships();
  const rels = data?.relationships ?? [];
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-gray-900">My Coaches</h1><p className="text-gray-500 text-sm mt-0.5">{rels.length} coaching relationship{rels.length!==1?"s":""}</p></div>
          <Link href="/coaching" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition">Find More Coaches</Link>
        </div>
        {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400"/></div>
          : rels.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Start your coaching journey</h3>
              <p className="text-gray-400 text-sm mb-6">Find a coach who will guide your transformation</p>
              <Link href="/coaching" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition">Browse Coaches</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {rels.map((r: any) => (
                <div key={r.rel_id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 transition shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-indigo-50 shrink-0">
                      {r.coach_photo?<img src={r.coach_photo} alt="" className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-xl">{r.coach_name?.[0]}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{r.coach_name}</h3>
                          {r.tagline && <p className="text-sm text-gray-500">{r.tagline}</p>}
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize shrink-0 ${r.status==="active"?"bg-emerald-50 text-emerald-700":"bg-gray-100 text-gray-500"}`}>{r.status}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="font-semibold text-indigo-600">{r.sessions_remaining} sessions left</span>
                        <span>{r.sessions_used} completed</span>
                        <span className="capitalize text-gray-400">{r.rel_type?.replace("_"," ")}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Link href={`/coachee/sessions?rel=${r.rel_id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 hover:bg-indigo-100 transition"><Calendar size={12}/>Sessions</Link>
                        <Link href={`/coachee/messages?rel=${r.rel_id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-xl text-xs font-semibold border border-violet-200 hover:bg-violet-100 transition"><MessageCircle size={12}/>Message</Link>
                        <Link href={`/coachee/goals?rel=${r.rel_id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 transition"><Target size={12}/>Goals</Link>
                        <Link href={`/coachee/tasks?rel=${r.rel_id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold border border-amber-200 hover:bg-amber-100 transition"><CheckSquare size={12}/>Tasks</Link>
                        <Link href={`/coachee/progress?rel=${r.rel_id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-100 transition"><BarChart2 size={12}/>Progress</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}