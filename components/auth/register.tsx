"use client";
import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import {
  Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles,
  Camera, X, CheckCircle, Loader2, Plus,
  Users, TrendingUp, Target, Star, Shield,
  Briefcase, Heart, Brain, Dumbbell, DollarSign, MessageCircle,
} from "lucide-react";


// ── Image compressor (WebP, client-side) ─────────────────────────────────────
async function compressToWebP(file: File, maxWidth = 400, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale  = img.width > maxWidth ? maxWidth / img.width : 1;
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error("Compression failed")), "image/webp", quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

// ── Specialization options ────────────────────────────────────────────────────
const SPECS = [
  { icon: Briefcase,     label: "Career & Leadership" },
  { icon: Brain,         label: "Mindset & Confidence" },
  { icon: Heart,         label: "Life & Wellbeing" },
  { icon: TrendingUp,    label: "Business & Strategy" },
  { icon: Dumbbell,      label: "Health & Fitness" },
  { icon: DollarSign,    label: "Finance & Wealth" },
  { icon: MessageCircle, label: "Communication" },
  { icon: Target,        label: "Productivity & Goals" },
  { icon: Star,          label: "Executive Coaching" },
  { icon: Users,         label: "Team & Culture" },
];

// ── Avatar uploader ───────────────────────────────────────────────────────────
function AvatarUploader({ preview, onFile }: { preview: string | null; onFile: (f: File | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => { /* preview handled by parent */ };
    onFile(f);
  };
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 mb-3">
        {preview ? (
          <>
            <img src={preview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 shadow-lg"/>
            <button type="button" onClick={()=>onFile(null)} className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow">
              <X size={12}/>
            </button>
          </>
        ) : (
          <button type="button" onClick={()=>ref.current?.click()}
            className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 flex flex-col items-center justify-center gap-1 transition group">
            <Camera size={20} className="text-indigo-300 group-hover:text-indigo-500 transition"/>
            <span className="text-[10px] text-indigo-300 group-hover:text-indigo-500">Upload</span>
          </button>
        )}
      </div>
      <button type="button" onClick={()=>ref.current?.click()} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">
        {preview ? "Change photo" : "Add profile photo"}
      </button>
      <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, WebP · Optional</p>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" onChange={handle} className="hidden"/>
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function Steps({ current, total, role }: { current: number; total: number; role: "coach"|"coachee" }) {
  const labels = role === "coach"
    ? ["Choose role", "Your details", "Coach profile", "Done"]
    : ["Choose role", "Your details", "Your goals", "Done"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {labels.slice(0, total).map((l, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i+1<current?"bg-indigo-600 text-white":i+1===current?"bg-indigo-600 text-white ring-4 ring-indigo-100":"bg-gray-100 text-gray-400"}`}>
              {i+1<current?<CheckCircle size={14}/>:i+1}
            </div>
            <span className={`text-[10px] font-medium whitespace-nowrap ${i+1===current?"text-indigo-600":"text-gray-400"}`}>{l}</span>
          </div>
          {i < total-1 && <div className={`flex-1 h-0.5 mb-4 rounded-full transition-all ${i+1<current?"bg-indigo-500":"bg-gray-200"}`}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}{required&&<span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const INPUT = "w-full h-12 px-4 border-2 border-gray-200 focus:border-indigo-500 rounded-xl outline-none text-gray-900 text-sm transition placeholder:text-gray-400 bg-gray-50 focus:bg-white";
const TEXTAREA = "w-full px-4 py-3 border-2 border-gray-200 focus:border-indigo-500 rounded-xl outline-none text-gray-900 text-sm transition placeholder:text-gray-400 bg-gray-50 focus:bg-white resize-none";

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SignUpPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const existingId   = searchParams.get("existing") || "";
  const existingName = searchParams.get("name")     || "";
  const preRole      = (searchParams.get("role") as "coach"|"coachee"|null) || null;

  const isExisting = !!existingId;

  const [step,     setStep]     = useState(preRole ? 2 : 1);
  const [role,     setRole]     = useState<"coach"|"coachee"|null>(preRole);
  const [loading,  setLoading]  = useState(false);
  const [imgPreview,setImgPreview] = useState<string|null>(null);
  const [imgFile,  setImgFile]  = useState<File|null>(null);
  const [showPw,   setShowPw]   = useState(false);
  const [showCpw,  setShowCpw]  = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [specInput, setSpecInput] = useState("");

  const [f, setF] = useState({
    firstname: "", lastname: "", email: "", phone: "", password: "", confirmPw: "",
    tagline: "", bio: "", sessionRate: "", goals: "", coachingStyle: "", idealCoachee: "",
  });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const handleImage = useCallback(async (file: File | null) => {
    if (!file) { setImgFile(null); setImgPreview(null); return; }
    setImgFile(file);
    const reader = new FileReader();
    reader.onload = e => setImgPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const toggleSpec = (s: string) => setSelectedSpecs(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]);
  const addCustomSpec = () => { const t = specInput.trim(); if (t && !selectedSpecs.includes(t)) { setSelectedSpecs(p=>[...p,t]); setSpecInput(""); } };

  const total = 3; // steps excluding role-pick (which is step 1 but only if no preRole)

  const submit = async () => {
    if (!role) return;
    if (!isExisting) {
      if (!f.firstname||!f.lastname) { toast.warning("Full name required."); return; }
      if (!f.email||!/\S+@\S+\.\S+/.test(f.email)) { toast.error("Valid email required."); return; }
      if (f.password.length<6) { toast.error("Password must be at least 6 characters."); return; }
      if (f.password!==f.confirmPw) { toast.error("Passwords don't match."); return; }
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("role", role);
      fd.append("existing_user_id", existingId);
      if (!isExisting) {
        fd.append("firstname", f.firstname);
        fd.append("lastname",  f.lastname);
        fd.append("email",     f.email);
        fd.append("phone",     f.phone);
        fd.append("password",  f.password);
      }
      if (role==="coach") {
        fd.append("tagline",      f.tagline);
        fd.append("bio",          f.bio);
        fd.append("session_rate", f.sessionRate);
        fd.append("coaching_style", f.coachingStyle);
        fd.append("ideal_coachee",  f.idealCoachee);
        selectedSpecs.forEach(s => fd.append("specializations[]", s));
      } else {
        fd.append("goals", f.goals);
      }

      if (imgFile) {
        try {
          const webp = await compressToWebP(imgFile);
          fd.append("avatar", webp, "avatar.webp");
        } catch { toast.error("Image compression failed."); setLoading(false); return; }
      }

      const res  = await fetch("/api/authentication/register", { method:"POST", body:fd });
      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.message || "Registration failed.");
        setLoading(false);
        return;
      }

      toast.success(json.message || "Account created!");

      if (!isExisting && json.metadata?.email && json.metadata?.password) {
        // Auto sign in
        const r = await signIn("credentials", {
          username: json.metadata.email,
          password: json.metadata.password,
          redirect: false,
        });
        if (!r?.error) {
          router.push(`/${json.metadata.role}`);
          return;
        }
      }
      setTimeout(() => router.push("/sign-in"), 1800);

    } catch {
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canContinueStep2 = isExisting || (f.firstname&&f.lastname&&f.email&&f.password&&f.confirmPw&&f.password.length>=6&&f.password===f.confirmPw);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
              <img
                                                          className="rounded-full"
                                                      
                                                          src="/logo.png"
                                                          alt="Logo"
                                                          width={32}
                                                          height={32}
                                                        /></div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 pt-8 pb-6">
            {role && <Steps current={step-(preRole?0:1)} total={total} role={role}/>}
            <h1 className="text-white font-bold text-2xl">
              {step===1 ? "Join CoachLife" :
               step===2 ? (isExisting ? `Welcome, ${existingName}` : "Your account") :
               step===3 ? (role==="coach" ? "Your coach profile" : "Your coaching goals") :
               "You're in! 🎉"}
            </h1>
            <p className="text-indigo-200 text-sm mt-1">
              {step===1 ? "How would you like to join?" :
               step===2 ? (isExisting ? "Upload a photo (optional) to continue" : "Create your login credentials") :
               step===3 ? (role==="coach" ? "Tell coachees what you offer" : "Help your coach understand you") :
               ""}
            </p>
          </div>

          <div className="p-8">
            {/* ── STEP 1: Choose role ── */}
            {step===1 && (
              <div className="space-y-4">
                {isExisting && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-4">
                    <p className="text-sm text-amber-800"><strong>Hi {existingName}!</strong> You have a system account but no coaching profile yet. Choose your role to get started.</p>
                  </div>
                )}
                {[
                  { r: "coachee" as const, title: "I want to be coached", sub: "Find a coach, set goals, track progress and transform your life", icon: <Users size={24} className="text-violet-600"/>, bg: "hover:border-violet-400 hover:bg-violet-50/50", active: "border-violet-500 bg-violet-50" },
                  { r: "coach"   as const, title: "I want to coach others", sub: "Apply as a coach, set your rate, build your client base and earn",   icon: <TrendingUp size={24} className="text-indigo-600"/>, bg: "hover:border-indigo-400 hover:bg-indigo-50/50", active: "border-indigo-500 bg-indigo-50" },
                ].map(o => (
                  <button key={o.r} type="button" onClick={()=>setRole(o.r)}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${role===o.r ? o.active : "border-gray-200 " + o.bg}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${role===o.r?"bg-white shadow-sm":"bg-gray-100"}`}>{o.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">{o.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5 leading-snug">{o.sub}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${role===o.r?"border-indigo-500 bg-indigo-500":"border-gray-300"}`}>
                      {role===o.r && <div className="w-2 h-2 bg-white rounded-full"/>}
                    </div>
                  </button>
                ))}
                <button disabled={!role} onClick={()=>setStep(2)}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition mt-2">
                  Continue <ArrowRight size={16}/>
                </button>
                <p className="text-center text-sm text-gray-400">Already have an account? <Link href="/sign-in" className="text-indigo-600 font-medium hover:text-indigo-500">Sign in</Link></p>
              </div>
            )}

            {/* ── STEP 2: Account details ── */}
            {step===2 && (
              <div className="space-y-5">
                {/* Avatar */}
                <AvatarUploader preview={imgPreview} onFile={handleImage}/>

                {isExisting ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <p className="text-sm text-emerald-800 flex items-center gap-2"><CheckCircle size={15} className="text-emerald-600 shrink-0"/>Using your existing account credentials. Your photo above (optional) will be used for your {role} profile.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="First name" required><input value={f.firstname} onChange={e=>set("firstname",e.target.value)} placeholder="Jane" className={INPUT}/></Field>
                      <Field label="Last name"  required><input value={f.lastname}  onChange={e=>set("lastname",e.target.value)}  placeholder="Doe"  className={INPUT}/></Field>
                    </div>
                    <Field label="Email address" required>
                      <input type="email" value={f.email} onChange={e=>set("email",e.target.value)} placeholder="jane@example.com" className={INPUT}/>
                    </Field>
                    <Field label="Phone number">
                      <input type="tel" value={f.phone} onChange={e=>set("phone",e.target.value)} placeholder="+250 788 000 000" className={INPUT}/>
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Password" required hint="At least 6 characters">
                        <div className="relative">
                          <input type={showPw?"text":"password"} value={f.password} onChange={e=>set("password",e.target.value)} placeholder="••••••••" className={INPUT+" pr-12"}/>
                          <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
                        </div>
                      </Field>
                      <Field label="Confirm password" required>
                        <div className="relative">
                          <input type={showCpw?"text":"password"} value={f.confirmPw} onChange={e=>set("confirmPw",e.target.value)} placeholder="••••••••" className={`${INPUT} pr-12 ${f.confirmPw&&f.confirmPw!==f.password?"border-red-300 focus:border-red-400":f.confirmPw&&f.confirmPw===f.password?"border-emerald-300 focus:border-emerald-400":""}`}/>
                          <button type="button" onClick={()=>setShowCpw(!showCpw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showCpw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
                        </div>
                      </Field>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={()=>setStep(preRole?1:1)} className="flex-1 h-12 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"><ArrowLeft size={15}/>Back</button>
                  <button onClick={()=>setStep(3)} disabled={!canContinueStep2} className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2">Continue<ArrowRight size={15}/></button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Role-specific details ── */}
            {step===3 && role==="coach" && (
              <div className="space-y-5">
                <Field label="Your tagline" hint="One line that tells coachees who you are">
                  <input value={f.tagline} onChange={e=>set("tagline",e.target.value)} placeholder="e.g. Executive coach helping leaders reach their peak" className={INPUT}/>
                </Field>
                <Field label="Your bio" hint="Share your story, philosophy, and what makes you unique">
                  <textarea value={f.bio} onChange={e=>set("bio",e.target.value)} rows={4} placeholder="Tell coachees about your background, approach, and what transformation looks like with you..." className={TEXTAREA}/>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Session rate (RWF)" hint="Per 60-min session, excl. platform fee">
                    <input type="number" value={f.sessionRate} onChange={e=>set("sessionRate",e.target.value)} placeholder="e.g. 50000" className={INPUT}/>
                  </Field>
                  <Field label="Ideal coachee">
                    <input value={f.idealCoachee} onChange={e=>set("idealCoachee",e.target.value)} placeholder="Who do you work best with?" className={INPUT}/>
                  </Field>
                </div>
                <Field label="Specializations">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {SPECS.map(s=>{
                      const Icon = s.icon; const active = selectedSpecs.includes(s.label);
                      return (
                        <button key={s.label} type="button" onClick={()=>toggleSpec(s.label)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${active?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-600 border-gray-200 hover:border-indigo-300"}`}>
                          <Icon size={11}/>{s.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <input value={specInput} onChange={e=>setSpecInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addCustomSpec())} placeholder="Add your own specialty..." className="flex-1 h-10 px-3 border-2 border-gray-200 focus:border-indigo-400 rounded-xl text-sm outline-none bg-gray-50 focus:bg-white"/>
                    <button type="button" onClick={addCustomSpec} className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition"><Plus size={14}/></button>
                  </div>
                  {selectedSpecs.filter(s=>!SPECS.map(x=>x.label).includes(s)).map(cs=>(
                    <span key={cs} className="inline-flex items-center gap-1.5 mt-2 mr-2 px-3 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-medium">
                      {cs}<button type="button" onClick={()=>toggleSpec(cs)}><X size={10}/></button>
                    </span>
                  ))}
                </Field>
                <div className="flex gap-3">
                  <button onClick={()=>setStep(2)} className="flex-1 h-12 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"><ArrowLeft size={15}/>Back</button>
                  <button onClick={submit} disabled={loading} className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2">
                    {loading?<><Loader2 size={14} className="animate-spin"/>Creating profile…</>:<>Apply as Coach<ArrowRight size={15}/></>}
                  </button>
                </div>
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <Shield size={14} className="text-amber-600 shrink-0"/>
                  <p className="text-xs text-amber-700">Coach applications are reviewed by our team. You'll be notified within 24–48 hours.</p>
                </div>
              </div>
            )}

            {step===3 && role==="coachee" && (
              <div className="space-y-5">
                <Field label="What do you want to achieve?" hint="Help your future coach understand your goals from day one">
                  <textarea value={f.goals} onChange={e=>set("goals",e.target.value)} rows={5}
                    placeholder={"Be as specific as you like. For example:\n\n• Get promoted to senior manager within 6 months\n• Build confidence to lead my team\n• Launch my business idea and find first clients"}
                    className={TEXTAREA}/>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Career Growth",    icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { label: "Life Balance",     icon: Heart,       color: "text-rose-500",  bg: "bg-rose-50" },
                    { label: "Business",          icon: Briefcase,   color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Mindset",           icon: Brain,       color: "text-violet-500",bg: "bg-violet-50" },
                  ].map(({ label, icon: Icon, color, bg }) => (
                    <button key={label} type="button"
                      onClick={()=>set("goals", f.goals+(f.goals?"\n":"")+"→ "+label+" goals")}
                      className={`flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-indigo-200 hover:${bg} transition text-left group`}>
                      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}><Icon size={15} className={color}/></div>
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={()=>setStep(2)} className="flex-1 h-12 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"><ArrowLeft size={15}/>Back</button>
                  <button onClick={submit} disabled={loading} className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2">
                    {loading?<><Loader2 size={14} className="animate-spin"/>Creating account…</>:<>Create Account<ArrowRight size={15}/></>}
                  </button>
                </div>
                <p className="text-center text-xs text-gray-400">Your goals are only visible to your coaches. You can always update them.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-indigo-500 hover:text-indigo-600">Terms</Link> and{" "}
          <Link href="/privacy" className="text-indigo-500 hover:text-indigo-600">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
