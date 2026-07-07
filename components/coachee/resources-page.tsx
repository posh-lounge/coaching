"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FolderOpen, BookOpen, File, FileText, Video, Music, Link as LinkIcon, Download, Loader2, Star, Calendar, MessageCircle, BarChart2, Bell, CheckCheck, Target, CheckSquare } from "lucide-react";
import { useCoacheeResources, useCoachResourceAction, useCoacheeNotifications, useMarkCoacheeNotifsRead, useCoacheeRelationships, useCoacheeProgress, useUpdateCoacheeProfile, useCoacheeProfile } from "@/lib/api/v1/hooks";


const TYPE_ICONS: Record<string, React.ReactNode> = { document:<FileText size={18} className="text-blue-500"/>, video:<Video size={18} className="text-red-500"/>, link:<LinkIcon size={18} className="text-indigo-500"/>, template:<File size={18} className="text-amber-500"/>, worksheet:<FileText size={18} className="text-emerald-500"/>, audio:<Music size={18} className="text-violet-500"/>, book:<BookOpen size={18} className="text-orange-500"/>, podcast:<Music size={18} className="text-pink-500"/> };

export default function CoacheeResourcesPage() {
  const [typeFilter, setTypeFilter] = useState("");
  const { data, isLoading } = useCoacheeResources(typeFilter || undefined);
  const action = useCoachResourceAction();
  const resources = data?.resources ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Resources</h1><p className="text-gray-500 text-sm mt-0.5">Tools and materials shared by your coaches</p></div>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[{v:"",l:"All"},{v:"document",l:"Docs"},{v:"video",l:"Videos"},{v:"link",l:"Links"},{v:"template",l:"Templates"},{v:"worksheet",l:"Worksheets"},{v:"book",l:"Books"},{v:"podcast",l:"Podcasts"}].map(f=>(
            <button key={f.v} onClick={()=>setTypeFilter(f.v)} className={`px-4 py-1.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${typeFilter===f.v?"bg-indigo-600 text-white":"bg-white border border-gray-200 text-gray-600 hover:border-indigo-200"}`}>{f.l}</button>
          ))}
        </div>
        {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400"/></div>
          : resources.length === 0 ? <div className="text-center py-20 bg-white rounded-2xl border border-gray-100"><FolderOpen size={40} className="mx-auto mb-3 text-gray-200"/><h3 className="text-lg font-bold text-gray-700">No resources yet</h3><p className="text-gray-400 text-sm mt-1">Your coaches will share resources here</p></div>
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((r: any) => {
                const tags = r.tags ? r.tags.split(",") : [];
                return (
                  <div key={r.resource_id} className="bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 transition p-5 flex flex-col gap-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">{TYPE_ICONS[r.type]??<File size={18} className="text-gray-400"/>}</div>
                      <div className="flex-1 min-w-0"><h3 className="font-semibold text-gray-900 truncate">{r.title}</h3><p className="text-xs text-gray-400">{r.coach_name}</p></div>
                    </div>
                    {r.description && <p className="text-sm text-gray-500 line-clamp-2">{r.description}</p>}
                    {tags.length > 0 && <div className="flex flex-wrap gap-1.5">{tags.map((t: string) => <span key={t} className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">{t.trim()}</span>)}</div>}
                    {r.url && (
                      <a href={r.url} target="_blank" onClick={() => action.mutate({ action:"track_open", resource_id:r.resource_id })} className="flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition">
                        {r.type==="link"?<><LinkIcon size={14}/>Open Link</>:<><Download size={14}/>Access Resource</>}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
};
