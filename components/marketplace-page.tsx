"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, Star, Users, Calendar, Shield, Sparkles, X, Loader2,
  MapPin, ChevronDown, ChevronUp, CheckCircle, ArrowRight,
  SlidersHorizontal, Clock,
} from "lucide-react";
import { useMarketplace, useCoachPublicProfile, useBuyPackage } from "@/lib/api/v1/hooks";
import Image from "next/image";
const fmt = (n: number) => `${Number(n || 0).toLocaleString()} RWF`;
const ALL_SPECS = ["Career & Leadership","Executive Coaching","Life Coaching","Business Strategy","Mindset & Confidence","Communication","Productivity","Finance & Wealth","Health & Fitness","Team & Culture","Relationships","Purpose & Values"];
const SORT_OPTS = [{v:"rating",l:"Top rated"},{v:"sessions",l:"Most sessions"},{v:"rate_asc",l:"Price: low"},{v:"rate_desc",l:"Price: high"},{v:"newest",l:"Newest"}];

function FilterSection({ title, children, open:defaultOpen=true }:{ title:string; children:React.ReactNode; open?:boolean }) {
  const [open,setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-4">
      <button onClick={()=>setOpen(!open)} className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 hover:text-indigo-600 transition mb-0.5">
        {title}{open?<ChevronUp size={14} className="text-gray-400"/>:<ChevronDown size={14} className="text-gray-400"/>}
      </button>
      {open&&<div className="mt-3">{children}</div>}
    </div>
  );
}

function Stars({ rating, count }:{ rating:number; count:number }) {
  return (
    <span className="flex items-center gap-1">
      <span className="flex gap-0.5">{[1,2,3,4,5].map(i=><Star key={i} size={11} className={i<=Math.round(rating)?"text-amber-400 fill-amber-400":"text-gray-200 fill-gray-200"}/>)}</span>
      <span className="text-xs font-semibold text-gray-700">{Number(rating).toFixed(1)}</span>
      <span className="text-xs text-gray-400">({count})</span>
    </span>
  );
}

function CoachCard({ coach, onClick }:{ coach:any; onClick:()=>void }) {
  const tags = coach.tags ? coach.tags.split(",").filter(Boolean).slice(0,3) : [];
  return (
    <div onClick={onClick} className="bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group p-5 flex gap-5">
      <div className="shrink-0 flex flex-col items-center gap-1">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100">
          {coach.profile_photo ? <img src={coach.profile_photo} alt={coach.display_name} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-2xl">{coach.display_name?.[0]}</div>}
        </div>
        {coach.is_verified && <span className="text-[10px] text-indigo-600 flex items-center gap-0.5 font-semibold"><Shield size={9}/>Verified</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-700 transition">{coach.display_name}</h3>
              {coach.is_featured && <Sparkles size={13} className="text-amber-500 shrink-0"/>}
            </div>
            <p className="text-sm text-gray-500 truncate mt-0.5">{coach.tagline}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-base font-extrabold text-gray-900">{fmt(coach.rate_with_fee)}</p>
            <p className="text-[11px] text-gray-400">/ session</p>
          </div>
        </div>
        <div className="flex items-center gap-4 my-2 text-xs text-gray-500 flex-wrap">
          {coach.rating_count>0 && <Stars rating={coach.rating_avg} count={coach.rating_count}/>}
          <span className="flex items-center gap-1"><Calendar size={11}/>{coach.sessions_total} sessions</span>
          {coach.active_coachees>0 && <span className="flex items-center gap-1"><Users size={11}/>{coach.active_coachees} active</span>}
          {coach.location && <span className="flex items-center gap-1 truncate"><MapPin size={11}/>{coach.location}</span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t:string)=><span key={t} className="text-[11px] px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium border border-indigo-100">{t.trim()}</span>)}
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:text-indigo-500 shrink-0 transition">View<ArrowRight size={12}/></button>
        </div>
      </div>
    </div>
  );
}

function ConnectModal({ coachId, onClose }:{ coachId:number; onClose:()=>void }) {
  const { data, isLoading } = useCoachPublicProfile(coachId);
  const buy = useBuyPackage();
  const [sessions, setSessions] = useState(5);
  const [method,   setMethod]   = useState("manual");
  const [step,     setStep]     = useState<"profile"|"buy"|"success">("profile");
  const coach = data?.coach;
  const rate  = Number(coach?.rate_with_fee ?? 0);
  const cr    = Number(coach?.session_rate  ?? 0);
  const total = rate * sessions;
  const fee   = total - cr * sessions;
  const DAY   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-gray-900">{step==="profile"?"Coach profile":step==="buy"?"Choose your package":"You're connected!"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition"><X size={16}/></button>
        </div>
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-16"><Loader2 size={28} className="animate-spin text-indigo-400"/></div>
        ) : step==="success" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5"><CheckCircle size={36} className="text-emerald-500"/></div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">You're connected with {coach?.display_name?.split(" ")[0]}!</h2>
            <p className="text-gray-500 text-sm mb-1">You've booked <strong>{sessions} sessions</strong>. Go to your dashboard to schedule your first one.</p>
            <Link href="/coachee" onClick={onClose} className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition">Go to dashboard <ArrowRight size={16}/></Link>
          </div>
        ) : step==="buy" && coach ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-indigo-100 shrink-0">{coach.profile_photo?<img src={coach.profile_photo} alt="" className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold">{coach.display_name?.[0]}</div>}</div>
              <div className="flex-1 min-w-0"><p className="font-bold text-gray-900 truncate">{coach.display_name}</p><p className="text-sm text-gray-500 truncate">{coach.tagline}</p></div>
              <div className="text-right shrink-0"><p className="font-extrabold text-gray-900">{fmt(rate)}</p><p className="text-xs text-gray-400">/ session</p></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2"><label className="text-sm font-semibold text-gray-700">Number of sessions</label><span className="text-2xl font-extrabold text-indigo-600">{sessions}</span></div>
              <input type="range" min={5} max={20} value={sessions} onChange={e=>setSessions(+e.target.value)} className="w-full accent-indigo-600"/>
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>5 min</span><span>20 max</span></div>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>{sessions} sessions × {fmt(rate)}</span><span className="font-semibold text-gray-900">{fmt(total)}</span></div>
              <div className="flex justify-between text-gray-400 text-xs"><span>Coach earns</span><span>{fmt(cr*sessions)}</span></div>
              <div className="flex justify-between text-gray-400 text-xs"><span>Platform fee (30%)</span><span>{fmt(fee)}</span></div>
              <div className="border-t border-indigo-200 pt-2 flex justify-between font-bold text-indigo-700 text-base"><span>Total</span><span>{fmt(total)}</span></div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment method</label>
              <div className="grid grid-cols-3 gap-2">{[{v:"manual",l:"💵 Cash"},{v:"momo",l:"📱 MoMo"},{v:"card",l:"💳 Card"}].map(m=><button key={m.v} onClick={()=>setMethod(m.v)} className={`py-3 rounded-xl text-sm font-medium border-2 transition ${method===m.v?"border-indigo-600 bg-indigo-50 text-indigo-700":"border-gray-200 text-gray-500 hover:border-indigo-200 bg-white"}`}>{m.l}</button>)}</div>
            </div>
            <button onClick={async()=>{await buy.mutateAsync({coach_id:coachId,sessions_count:sessions,payment_method:method});setStep("success");}} disabled={buy.isPending} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl font-bold text-base transition flex items-center justify-center gap-2">
              {buy.isPending&&<Loader2 size={16} className="animate-spin"/>}Pay {fmt(total)} and connect
            </button>
            <p className="text-center text-xs text-gray-400">Sessions expire after 1 year. 30% platform fee is included.</p>
          </div>
        ) : coach ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="relative bg-gradient-to-r from-indigo-500 to-violet-600 h-28 shrink-0">
                {coach.cover_photo && <img src={coach.cover_photo} alt="" className="w-full h-full object-cover absolute inset-0"/>}
                <div className="absolute -bottom-8 left-6"><div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-lg">{coach.profile_photo?<img src={coach.profile_photo} alt="" className="w-full h-full object-cover"/>:<div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-2xl bg-indigo-100">{coach.display_name?.[0]}</div>}</div></div>
              </div>
              <div className="px-6 pt-12 pb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2"><h2 className="text-2xl font-extrabold text-gray-900">{coach.display_name}</h2>{coach.is_verified&&<Shield size={16} className="text-indigo-500"/>}{coach.is_featured&&<Sparkles size={16} className="text-amber-500"/>}</div>
                    <p className="text-gray-500">{coach.tagline}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                      {coach.rating_count>0&&<Stars rating={coach.rating_avg} count={coach.rating_count}/>}
                      <span className="flex items-center gap-1"><Calendar size={13}/>{coach.sessions_total} sessions</span>
                      {coach.location&&<span className="flex items-center gap-1"><MapPin size={13}/>{coach.location}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4"><p className="text-2xl font-extrabold text-gray-900">{fmt(rate)}</p><p className="text-xs text-gray-400">/ session (incl. fee)</p></div>
                </div>
                {coach.tags&&<div className="flex flex-wrap gap-2 mb-5">{coach.tags.split(",").filter(Boolean).map((t:string)=><span key={t} className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full font-medium border border-indigo-100">{t.trim()}</span>)}</div>}
                {coach.bio&&<div className="mb-5"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">About</p><p className="text-sm text-gray-700 leading-relaxed">{coach.bio}</p></div>}
                {(coach.coaching_style||coach.ideal_coachee)&&<div className="grid grid-cols-2 gap-4 mb-5">{coach.coaching_style&&<div className="bg-gray-50 rounded-xl p-4"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Coaching style</p><p className="text-sm text-gray-700">{coach.coaching_style}</p></div>}{coach.ideal_coachee&&<div className="bg-gray-50 rounded-xl p-4"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Works best with</p><p className="text-sm text-gray-700">{coach.ideal_coachee}</p></div>}</div>}
                {data?.availability?.length>0&&<div className="mb-5"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Availability</p><div className="flex flex-wrap gap-2">{data.availability.map((a:any,i:number)=><span key={i} className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium flex items-center gap-1"><Clock size={11}/>{DAY[a.day_of_week]} {a.time_from}–{a.time_to}</span>)}</div></div>}
                {data?.reviews?.length>0&&<div className="mb-5"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Reviews</p><div className="space-y-3">{data.reviews.slice(0,4).map((r:any)=><div key={r.review_id} className="bg-gray-50 rounded-xl p-4 border border-gray-100"><div className="flex items-center gap-2 mb-2"><span className="flex gap-0.5">{[1,2,3,4,5].map(i=><Star key={i} size={11} className={i<=r.rating?"text-amber-400 fill-amber-400":"text-gray-200 fill-gray-200"}/>)}</span><span className="text-xs text-gray-400 font-medium">{r.coachee_name}</span><span className="text-xs text-gray-300">·</span><span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString("en-US",{month:"short",year:"numeric"})}</span></div>{r.comment&&<p className="text-sm text-gray-700 leading-relaxed">"{r.comment}"</p>}</div>)}</div></div>}
                {data?.badges?.length>0&&<div className="mb-4"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Badges</p><div className="flex flex-wrap gap-2">{data.badges.map((b:any)=><span key={b.badge_id} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-medium">{b.icon} {b.name}</span>)}</div></div>}
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 shrink-0 bg-white">
              <div className="flex items-center gap-4">
                <div><p className="font-extrabold text-gray-900 text-lg">{fmt(rate)}<span className="text-xs font-normal text-gray-400 ml-1">/ session</span></p><p className="text-xs text-gray-400">Min 5 sessions · fee included</p></div>
                <button onClick={()=>setStep("buy")} className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition flex items-center justify-center gap-2">Connect with {coach.display_name?.split(" ")[0]}<ArrowRight size={16}/></button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [search, setSearch]   = useState("");
  const [sort,   setSort]     = useState("rating");
  const [page,   setPage]     = useState(1);
  const [tag,    setTag]      = useState("");
  const [minRate,setMinRate]  = useState("");
  const [maxRate,setMaxRate]  = useState("");
  const [selected,setSelected]= useState<number|null>(null);
  const [showSidebar,setShowSidebar] = useState(false);

  const filters = useMemo(()=>({ search, tag, sort, page, min_rate:minRate?+minRate:undefined, max_rate:maxRate?+maxRate:undefined }),[search,tag,sort,page,minRate,maxRate]);
  const { data, isLoading } = useMarketplace(filters);
  const coaches = data?.coaches ?? [];
  const tags    = data?.tags    ?? [];
  const total   = data?.total   ?? 0;
  const activeF = [tag, minRate, maxRate].filter(Boolean).length;
  const clearF  = () => { setTag(""); setMinRate(""); setMaxRate(""); setPage(1); };

  const CheckBox = ({ val, active }:{ val:string; active:boolean }) => (
    <div onClick={()=>{ setTag(active?"":val); setPage(1); }} className={`w-4 h-4 rounded border-2 flex items-center justify-center transition cursor-pointer shrink-0 ${active?"bg-indigo-600 border-indigo-600":"border-gray-300 hover:border-indigo-400"}`}>
      {active&&<CheckCircle size={10} className="text-white"/>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0 mr-3">
               <Image
                                      className="rounded-full"
                                  
                                      src="/logo.png"
                                      alt="Logo"
                                      width={32}
                                      height={32}
                                    />
          </Link>
          <div className="relative flex-1 max-w-2xl">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search coaches by name, specialty, or goal..."
              className="w-full h-10 pl-10 pr-4 bg-gray-100 hover:bg-gray-200 focus:bg-white border border-transparent focus:border-indigo-400 rounded-xl outline-none text-sm text-gray-900 transition placeholder:text-gray-400"/>
          </div>
          <select value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}} className="h-10 px-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 outline-none hover:border-indigo-300 transition cursor-pointer shrink-0">
            {SORT_OPTS.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          <button onClick={()=>setShowSidebar(!showSidebar)} className={`lg:hidden flex items-center gap-1.5 h-10 px-4 rounded-xl border text-sm font-medium transition shrink-0 ${showSidebar||activeF>0?"bg-indigo-600 text-white border-indigo-600":"bg-white border-gray-200 text-gray-700"}`}>
            <SlidersHorizontal size={14}/>Filters{activeF>0&&` (${activeF})`}
          </button>
          <div className="flex items-center gap-2 shrink-0 hidden sm:flex">
            <Link href="/sign-in" className="h-10 px-4 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:border-indigo-300 transition flex items-center">Sign in</Link>
            <Link href="/sign-up" className="h-10 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition flex items-center">Get started</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-7 flex gap-6">
        {/* Sidebar */}
        <aside className={`w-60 shrink-0 ${showSidebar?"block":"hidden"} lg:block`}>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-20">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-sm">Filters</h2>
              {activeF>0&&<button onClick={clearF} className="text-xs text-indigo-600 font-medium hover:text-indigo-500">Clear all</button>}
            </div>
            <div className="px-4">
              <FilterSection title="Specialty">
                <div className="space-y-2">
                  {ALL_SPECS.map(s=>(
                    <label key={s} className="flex items-center gap-2.5 cursor-pointer group" onClick={()=>{setTag(tag===s?"":s);setPage(1);}}>
                      <CheckBox val={s} active={tag===s}/>
                      <span className="text-sm text-gray-700 group-hover:text-indigo-600 transition">{s}</span>
                    </label>
                  ))}
                  {tags.filter(t=>!ALL_SPECS.includes(t)).slice(0,4).map(t=>(
                    <label key={t} className="flex items-center gap-2.5 cursor-pointer group" onClick={()=>{setTag(tag===t?"":t);setPage(1);}}>
                      <CheckBox val={t} active={tag===t}/>
                      <span className="text-sm text-gray-700 group-hover:text-indigo-600 transition">{t}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>
              <FilterSection title="Price range" open={false}>
                <div className="space-y-2.5">
                  <div><label className="text-xs text-gray-400 mb-1 block">Min (RWF)</label><input type="number" value={minRate} onChange={e=>{setMinRate(e.target.value);setPage(1);}} placeholder="0" className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-400 bg-gray-50"/></div>
                  <div><label className="text-xs text-gray-400 mb-1 block">Max (RWF)</label><input type="number" value={maxRate} onChange={e=>{setMaxRate(e.target.value);setPage(1);}} placeholder="500 000" className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-400 bg-gray-50"/></div>
                </div>
              </FilterSection>
            </div>
            <div className="px-4 py-4 border-t border-gray-100 bg-indigo-50/60">
              <p className="text-xs font-bold text-indigo-800 mb-0.5">Are you a coach?</p>
              <p className="text-xs text-indigo-600 mb-3 leading-snug">Apply and start coaching on CoachLife.</p>
              <Link href="/sign-up?role=coach" className="block text-center py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition">Apply as a coach</Link>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{tag?`${tag} coaches`:search?`Results for "${search}"`:"Browse coaches"}</h1>
              <p className="text-sm text-gray-400 mt-0.5">{total>0?`${total} coach${total!==1?"es":""} available`:"No coaches found"}</p>
            </div>
            {activeF>0&&(
              <div className="flex items-center gap-2">
                {tag&&<span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">{tag}<button onClick={()=>{setTag("");setPage(1);}}><X size={11}/></button></span>}
                <button onClick={clearF} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_,i)=>(
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-5 animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl shrink-0"/>
                  <div className="flex-1 space-y-2.5"><div className="h-4 bg-gray-200 rounded w-1/3"/><div className="h-3 bg-gray-100 rounded w-2/3"/><div className="h-3 bg-gray-100 rounded w-1/2"/></div>
                </div>
              ))}
            </div>
          ) : coaches.length===0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Search size={24} className="text-gray-300"/></div>
              <h3 className="text-lg font-bold text-gray-700 mb-1">No coaches found</h3>
              <p className="text-gray-400 text-sm mb-5">Try different keywords or clear your filters</p>
              <button onClick={()=>{setSearch("");clearF();}} className="text-indigo-600 font-semibold text-sm hover:text-indigo-500">Clear all filters</button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {coaches.map((c:any)=><CoachCard key={c.coach_id} coach={c} onClick={()=>setSelected(c.coach_id)}/>)}
              </div>
              {(total>12||page>1)&&(
                <div className="flex items-center justify-center gap-3 mt-8">
                  {page>1&&<button onClick={()=>setPage(p=>p-1)} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:border-indigo-300 transition">← Previous</button>}
                  <span className="text-sm text-gray-400 px-2">Page {page}</span>
                  {coaches.length===12&&<button onClick={()=>setPage(p=>p+1)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition">Next →</button>}
                </div>
              )}
            </>
          )}
        </main>
      </div>
      {selected&&<ConnectModal coachId={selected} onClose={()=>setSelected(null)}/>}
    </div>
  );
}
