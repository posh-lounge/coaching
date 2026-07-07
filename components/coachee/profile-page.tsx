"use client";
import React, { useState, useEffect } from "react";
import { Save, Loader2, Award, ExternalLink } from "lucide-react";
import { useCoacheeProfile, useUpdateCoacheeProfile } from "@/lib/api/v1/hooks";

const TABS = ["Profile", "Badges & Certificates", "Notifications"];

export default function CoacheeProfilePage() {
  const { data, isLoading } = useCoacheeProfile();
  const update = useUpdateCoacheeProfile();
  const [tab, setTab] = useState("Profile");
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState({ display_name: "", bio: "", goals: "", location: "", occupation: "", coaching_experience: "first_time" });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!data?.profile) return;
    const p = data.profile;
    setF({ display_name: p.display_name ?? "", bio: p.bio ?? "", goals: p.goals ?? "", location: p.location ?? "", occupation: p.occupation ?? "", coaching_experience: p.coaching_experience ?? "first_time" });
  }, [data]);

  const save = async () => {
    await update.mutateAsync(f);
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-indigo-400"/></div>;

  const profile  = data?.profile  ?? {};
  const badges   = data?.badges   ?? [];
  const certs    = data?.certificates ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
          <div className="h-20 bg-gradient-to-r from-violet-500 to-indigo-600"/>
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-8 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden shrink-0">
                {profile.profile_photo ? <img src={profile.profile_photo} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-2xl">{f.display_name?.[0] ?? "C"}</div>}
              </div>
              <div className="pb-1">
                <h1 className="text-xl font-bold text-gray-900">{f.display_name || "Your Name"}</h1>
                <p className="text-gray-500 text-sm">{f.occupation || "Add your occupation"}</p>
              </div>
            </div>
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {badges.slice(0, 6).map((b: any) => <span key={b.badge_id} title={b.description} className="text-2xl cursor-default">{b.icon}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === t ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-200"}`}>{t}</button>)}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          {tab === "Profile" && (
            <div className="space-y-4">
              <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Display Name *</label><input value={f.display_name} onChange={e => set("display_name", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none"/></div>
              <div><label className="text-sm font-semibold text-gray-700 mb-1 block">About You</label><textarea value={f.bio} onChange={e => set("bio", e.target.value)} rows={3} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-3 text-sm outline-none resize-none" placeholder="Tell your coach about yourself..."/></div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">🎯 Your Goals</label>
                <textarea value={f.goals} onChange={e => set("goals", e.target.value)} rows={4} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-3 text-sm outline-none resize-none" placeholder={"What do you want to achieve through coaching?\nWhat does your ideal life look like?\nWhat's holding you back right now?"}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Occupation</label><input value={f.occupation} onChange={e => set("occupation", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="e.g. Software Engineer"/></div>
                <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Location</label><input value={f.location} onChange={e => set("location", e.target.value)} className="w-full border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="City, Country"/></div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Coaching Experience</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ v: "first_time", l: "First time", e: "🌱" }, { v: "some_experience", l: "Some exp.", e: "🌿" }, { v: "experienced", l: "Experienced", e: "🌳" }].map(o => (
                    <button key={o.v} onClick={() => set("coaching_experience", o.v)} className={`py-2.5 rounded-xl border-2 text-sm font-medium transition text-center ${f.coaching_experience === o.v ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-500 hover:border-indigo-200"}`}>{o.e} {o.l}</button>
                  ))}
                </div>
              </div>
              <button onClick={save} disabled={update.isPending} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold transition disabled:opacity-40 flex items-center justify-center gap-2">
                {update.isPending ? <><Loader2 size={16} className="animate-spin"/>Saving...</> : saved ? <>✓ Saved!</> : <><Save size={16}/>Save Profile</>}
              </button>
            </div>
          )}

          {tab === "Badges & Certificates" && (
            <div>
              {badges.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Award size={16} className="text-amber-500"/>Badges Earned</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {badges.map((b: any) => (
                      <div key={b.badge_id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <span className="text-3xl">{b.icon}</span>
                        <div><p className="text-sm font-bold text-amber-900">{b.name}</p><p className="text-xs text-amber-600">{b.description}</p><p className="text-xs text-amber-400 mt-0.5">Earned {new Date(b.awarded_at).toLocaleDateString()}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {certs.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">🏆 Certificates</h3>
                  <div className="space-y-3">
                    {certs.map((c: any) => (
                      <div key={c.cert_id} className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-200">
                        <div className="flex items-start justify-between">
                          <div><p className="font-bold text-indigo-900">{c.title}</p><p className="text-sm text-indigo-600">Coach: {c.coach_name} · {c.sessions_done} sessions</p><p className="text-xs text-indigo-400 mt-0.5">Ref: {c.cert_ref} · {new Date(c.issued_at).toLocaleDateString()}</p></div>
                          <ExternalLink size={16} className="text-indigo-400 shrink-0 mt-0.5"/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {badges.length === 0 && certs.length === 0 && (
                <div className="text-center py-12"><Award size={40} className="mx-auto mb-3 text-gray-200"/><p className="text-gray-500 font-medium">No badges yet</p><p className="text-gray-400 text-sm mt-1">Complete sessions, tasks and goals to earn badges</p></div>
              )}
            </div>
          )}

          {tab === "Notifications" && (
            <div className="space-y-1">
              {[["Session scheduled", "When your coach books a session"], ["Session reminders", "1 hour before each session"], ["Task assigned", "When you receive a new task"], ["Task reviewed", "When your coach reviews your submission"], ["New message", "When your coach sends you a message"], ["Goal update", "When your coach updates a goal"], ["Resource shared", "When a resource is shared with you"]].map(([l, s]) => (
                <label key={l} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 cursor-pointer">
                  <div><p className="text-sm font-medium text-gray-900">{l}</p><p className="text-xs text-gray-400">{s}</p></div>
                  <input type="checkbox" defaultChecked className="sr-only peer"/>
                  <div className="relative w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"/>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
