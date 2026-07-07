"use client";
import React, { useState } from "react";
import { FolderOpen, Plus, X, Loader2, FileText, Video, Link as LinkIcon, BookOpen, Download, Music, File, Trash2, Share2 } from "lucide-react";
import { useCoachResources, useCoachResourceAction, useCoachees } from "@/lib/api/v1/hooks";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  document:  <FileText size={20} className="text-blue-500"/>,
  video:     <Video size={20} className="text-red-500"/>,
  link:      <LinkIcon size={20} className="text-indigo-500"/>,
  template:  <File size={20} className="text-amber-500"/>,
  worksheet: <FileText size={20} className="text-emerald-500"/>,
  audio:     <Music size={20} className="text-violet-500"/>,
  book:      <BookOpen size={20} className="text-orange-500"/>,
  podcast:   <Music size={20} className="text-pink-500"/>,
};
const VIS_LABELS: Record<string, string> = { private: "Only me", my_coachees: "All my coachees", public: "Everyone" };

function UploadModal({ onClose }: { onClose: () => void }) {
  const action = useCoachResourceAction();
  const [f, setF] = useState({ title: "", description: "", type: "document", url: "", tags: "", visibility: "my_coachees" });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));
  const handle = async () => {
    if (!f.title) return;
    await action.mutateAsync({ action: "create", ...f });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
          <h2 className="text-white font-bold text-xl">Add Resource</h2>
          <p className="text-indigo-200 text-sm">Share knowledge that transforms your coachees</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {["document","video","link","template","worksheet","audio","book","podcast"].map(t => (
                <button key={t} onClick={() => set("type", t)} className={`py-2 rounded-xl text-xs font-medium border-2 capitalize transition ${f.type === t ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-500 hover:border-indigo-200"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Title *</label>
            <input value={f.title} onChange={e => set("title", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="e.g. Goal Setting Workbook"/>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">URL / Link</label>
            <input value={f.url} onChange={e => set("url", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="https://..."/>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Description</label>
            <textarea value={f.description} onChange={e => set("description", e.target.value)} rows={2} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none resize-none" placeholder="What is this about?"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Tags</label>
              <input value={f.tags} onChange={e => set("tags", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="leadership, goals..."/>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Visibility</label>
              <select value={f.visibility} onChange={e => set("visibility", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none bg-white">
                {Object.entries(VIS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handle} disabled={action.isPending || !f.title} className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
            {action.isPending && <Loader2 size={14} className="animate-spin"/>}Add Resource
          </button>
        </div>
      </div>
    </div>
  );
}

function ShareModal({ resource, onClose }: { resource: any; onClose: () => void }) {
  const action = useCoachResourceAction();
  const { data } = useCoachees("active");
  const rels = data?.coachees ?? [];
  const [selected, setSelected] = useState<number[]>([]);
  const toggle = (id: number) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const share = async () => {
    await action.mutateAsync({ action: "share", resource_id: resource.resource_id, rel_ids: selected });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Share Resource</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Select coachees to share <strong>"{resource.title}"</strong> with:</p>
        <div className="space-y-2 mb-5 max-h-48 overflow-y-auto">
          {rels.map((r: any) => (
            <label key={r.rel_id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={selected.includes(r.rel_id)} onChange={() => toggle(r.rel_id)} className="w-4 h-4 rounded text-indigo-600"/>
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0 overflow-hidden">
                {r.profile_photo ? <img src={r.profile_photo} alt="" className="w-full h-full object-cover"/> : r.display_name?.[0]}
              </div>
              <span className="text-sm font-medium text-gray-900">{r.display_name}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={share} disabled={action.isPending || selected.length === 0} className="flex-1 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
            {action.isPending && <Loader2 size={14} className="animate-spin"/>}<Share2 size={14}/>Share to {selected.length} coachee{selected.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoachResourcesPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [sharing,    setSharing]    = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState("");
  const { data, isLoading } = useCoachResources();
  const action = useCoachResourceAction();
  const resources = (data?.resources ?? []).filter((r: any) => !typeFilter || r.type === typeFilter);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resource Library</h1>
            <p className="text-gray-500 text-sm mt-0.5">Tools and materials that accelerate your coachees' growth</p>
          </div>
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition"><Plus size={16}/>Add Resource</button>
        </div>

        {/* Type filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[{ v: "", l: "All" }, { v: "document", l: "Docs" }, { v: "video", l: "Videos" }, { v: "link", l: "Links" }, { v: "template", l: "Templates" }, { v: "worksheet", l: "Worksheets" }, { v: "book", l: "Books" }, { v: "podcast", l: "Podcasts" }].map(f => (
            <button key={f.v} onClick={() => setTypeFilter(f.v)} className={`px-4 py-1.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${typeFilter === f.v ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-200"}`}>{f.l}</button>
          ))}
        </div>

        {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400"/></div>
          : resources.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <FolderOpen size={40} className="mx-auto mb-3 text-gray-200"/>
              <h3 className="text-lg font-bold text-gray-700 mb-1">No resources yet</h3>
              <p className="text-gray-400 text-sm mb-5">Add worksheets, videos, books and links that will transform your coachees</p>
              <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-500 transition"><Plus size={14}/>Add First Resource</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((r: any) => {
                const tags = r.tags ? r.tags.split(",") : [];
                return (
                  <div key={r.resource_id} className="bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 transition p-5 flex flex-col gap-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                        {TYPE_ICONS[r.type] ?? <File size={20} className="text-gray-400"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{r.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full capitalize">{r.type}</span>
                          <span className="text-[10px] text-gray-400">{VIS_LABELS[r.visibility] ?? r.visibility}</span>
                        </div>
                      </div>
                    </div>
                    {r.description && <p className="text-sm text-gray-500 line-clamp-2">{r.description}</p>}
                    {tags.length > 0 && <div className="flex flex-wrap gap-1.5">{tags.map((t: string) => <span key={t} className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">{t.trim()}</span>)}</div>}
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Download size={10}/>{r.download_count ?? 0} opens</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <button onClick={() => setSharing(r)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 hover:bg-indigo-100 transition">
                        <Share2 size={12}/>Share
                      </button>
                      {r.url && <a href={r.url} target="_blank" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-100 transition"><LinkIcon size={12}/>Open</a>}
                      <button onClick={() => action.mutate({ action: "delete", resource_id: r.resource_id })} className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-400 rounded-xl border border-red-100 hover:bg-red-100 transition shrink-0">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)}/>}
      {sharing && <ShareModal resource={sharing} onClose={() => setSharing(null)}/>}
    </div>
  );
}
