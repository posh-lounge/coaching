"use client";
import React, { useState, useEffect } from "react";
import { Save, Loader2, Plus, X, Clock } from "lucide-react";
import { useCoachProfile, useUpdateCoachProfile } from "@/lib/api/v1/hooks";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const SPECS = ["Leadership","Career","Executive","Life","Business","Wellness","Mindset","Productivity","Communication","Finance","Relationships","Parenting","Health","Sports","Creative","Confidence","Purpose","Resilience"];
const TABS = ["Profile","Specializations","Availability","Notifications"];

export default function CoachProfilePage() {
  const { data, isLoading } = useCoachProfile();
  const update = useUpdateCoachProfile();
  const [tab, setTab] = useState("Profile");
  const [saved, setSaved] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [slots, setSlots] = useState<any[]>([]);
  const [f, setF] = useState({
    display_name: "", tagline: "", bio: "", coaching_style: "", ideal_coachee: "",
    session_rate: "", years_experience: "", max_coachees: "10", location: "",
    languages: "", linkedin_url: "", website_url: "",
  });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!data?.coach) return;
    const c = data.coach;
    setF({ display_name: c.display_name ?? "", tagline: c.tagline ?? "", bio: c.bio ?? "", coaching_style: c.coaching_style ?? "", ideal_coachee: c.ideal_coachee ?? "", session_rate: c.session_rate ?? "", years_experience: c.years_experience ?? "", max_coachees: c.max_coachees ?? "10", location: c.location ?? "", languages: c.languages ?? "", linkedin_url: c.linkedin_url ?? "", website_url: c.website_url ?? "" });
    setTags(c.tags ? c.tags.split(",").filter(Boolean) : []);
    setSlots(data.availability ?? []);
  }, [data]);

  const addTag = (t: string) => { const c = t.trim(); if (c && !tags.includes(c)) setTags(p => [...p, c]); setTagInput(""); };
  const addSlot = () => setSlots(s => [...s, { day_of_week: 1, time_from: "09:00", time_to: "17:00" }]);
  const setSlot = (i: number, k: string, v: any) => setSlots(s => s.map((sl, idx) => idx === i ? { ...sl, [k]: v } : sl));
  const rmSlot  = (i: number) => setSlots(s => s.filter((_, idx) => idx !== i));

  const save = async () => {
    if (tab === "Profile") await update.mutateAsync({ action: "update", ...f });
    else if (tab === "Specializations") await update.mutateAsync({ action: "update_specializations", tags });
    else if (tab === "Availability") await update.mutateAsync({ action: "update_availability", slots });
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-indigo-400"/></div>;

  const coach = data?.coach;
  const badges = data?.badges ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header card */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
          <div className="h-24 bg-gradient-to-r from-indigo-500 to-violet-600"/>
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden shrink-0">
                {coach?.profile_photo ? <img src={coach.profile_photo} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl">{f.display_name?.[0] ?? "C"}</div>}
              </div>
              <div className="pb-1">
                <h1 className="text-xl font-bold text-gray-900">{f.display_name || "Your Name"}</h1>
                <p className="text-gray-500 text-sm">{f.tagline || "Add your tagline"}</p>
              </div>
            </div>
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {badges.map((b: any) => <span key={b.badge_id} className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">{b.icon} {b.name}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === t ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-200"}`}>{t}</button>)}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">

          {tab === "Profile" && <>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="text-sm font-semibold text-gray-700 mb-1 block">Display Name *</label><input value={f.display_name} onChange={e => set("display_name", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none"/></div>
              <div className="col-span-2"><label className="text-sm font-semibold text-gray-700 mb-1 block">Professional Tagline</label><input value={f.tagline} onChange={e => set("tagline", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="e.g. Executive Coach | Transforming Leaders Since 2015"/></div>
              <div className="col-span-2"><label className="text-sm font-semibold text-gray-700 mb-1 block">Professional Bio</label><textarea value={f.bio} onChange={e => set("bio", e.target.value)} rows={4} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-3 text-sm outline-none resize-none" placeholder="Share your story, your coaching philosophy, what drives you..."/></div>
              <div className="col-span-2"><label className="text-sm font-semibold text-gray-700 mb-1 block">🎯 Coaching Style</label><textarea value={f.coaching_style} onChange={e => set("coaching_style", e.target.value)} rows={3} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-3 text-sm outline-none resize-none" placeholder="How do you show up as a coach? What's your approach?"/></div>
              <div className="col-span-2"><label className="text-sm font-semibold text-gray-700 mb-1 block">✨ Ideal Coachee</label><textarea value={f.ideal_coachee} onChange={e => set("ideal_coachee", e.target.value)} rows={2} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-3 text-sm outline-none resize-none" placeholder="Who do you work best with? What kind of person thrives with your coaching?"/></div>
              <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Session Rate (RWF)</label><input type="number" value={f.session_rate} onChange={e => set("session_rate", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="50000"/></div>
              <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Max Coachees</label><input type="number" value={f.max_coachees} onChange={e => set("max_coachees", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none"/></div>
              <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Years Experience</label><input type="number" value={f.years_experience} onChange={e => set("years_experience", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none"/></div>
              <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Location</label><input value={f.location} onChange={e => set("location", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="Kigali, Rwanda"/></div>
              <div className="col-span-2"><label className="text-sm font-semibold text-gray-700 mb-1 block">Languages</label><input value={f.languages} onChange={e => set("languages", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="English, French, Kinyarwanda"/></div>
              <div><label className="text-sm font-semibold text-gray-700 mb-1 block">LinkedIn</label><input value={f.linkedin_url} onChange={e => set("linkedin_url", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="https://linkedin.com/in/..."/></div>
              <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Website</label><input value={f.website_url} onChange={e => set("website_url", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="https://..."/></div>
            </div>
          </>}

          {tab === "Specializations" && <>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Your Specializations</label>
              <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
                {tags.map(t => <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-sm font-medium">{t}<button onClick={() => setTags(p => p.filter(x => x !== t))} className="hover:text-red-500 transition"><X size={12}/></button></span>)}
                {tags.length === 0 && <p className="text-sm text-gray-400 italic">No specializations yet</p>}
              </div>
              <div className="flex gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag(tagInput)} className="flex-1 border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="Type a specialization and press Enter..."/>
                <button onClick={() => addTag(tagInput)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 transition"><Plus size={16}/></button>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Quick Add</label>
              <div className="flex flex-wrap gap-2">
                {SPECS.filter(s => !tags.includes(s)).map(s => <button key={s} onClick={() => addTag(s)} className="text-xs px-3 py-1.5 border border-gray-200 text-gray-500 rounded-full hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition">{s}</button>)}
              </div>
            </div>
          </>}

          {tab === "Availability" && <>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div><h3 className="font-semibold text-gray-900">Weekly Availability</h3><p className="text-gray-400 text-sm">Set your regular coaching hours</p></div>
                <button onClick={addSlot} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-500 transition"><Plus size={14}/>Add Slot</button>
              </div>
              {slots.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                  <Clock size={32} className="mx-auto mb-2 text-gray-300"/>
                  <p className="text-gray-400 text-sm">No availability set yet</p>
                  <button onClick={addSlot} className="text-indigo-600 text-sm font-semibold mt-2 hover:text-indigo-500">Add your first slot →</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {slots.map((sl, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <select value={sl.day_of_week} onChange={e => setSlot(i, "day_of_week", +e.target.value)} className="border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-3 py-2 text-sm outline-none bg-white">
                        {DAYS.map((d, idx) => <option key={idx} value={idx}>{d}</option>)}
                      </select>
                      <input type="time" value={sl.time_from} onChange={e => setSlot(i, "time_from", e.target.value)} className="border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-3 py-2 text-sm outline-none"/>
                      <span className="text-gray-400 text-sm">to</span>
                      <input type="time" value={sl.time_to}   onChange={e => setSlot(i, "time_to",   e.target.value)} className="border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-3 py-2 text-sm outline-none"/>
                      <button onClick={() => rmSlot(i)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"><X size={16}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>}

          {tab === "Notifications" && (
            <div className="space-y-1">
              {[["Session scheduled", "When a session is booked with you"], ["Session reminders", "1 hour before each session"], ["Task updates", "When tasks are submitted for review"], ["New messages", "When coachees send you a message"], ["Payment received", "When a coachee purchases sessions"], ["Review received", "When you get a new rating or review"], ["Goal achieved", "When a coachee achieves a goal"]].map(([l, s]) => (
                <label key={l} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 cursor-pointer">
                  <div><p className="text-sm font-medium text-gray-900">{l}</p><p className="text-xs text-gray-400">{s}</p></div>
                  <input type="checkbox" defaultChecked className="sr-only peer"/>
                  <div className="relative w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"/>
                </label>
              ))}
            </div>
          )}

          <button onClick={save} disabled={update.isPending} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
            {update.isPending ? <><Loader2 size={16} className="animate-spin"/>Saving...</> : saved ? <>✓ Saved!</> : <><Save size={16}/>Save {tab}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
