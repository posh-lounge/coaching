"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, ArrowRight, Sparkles, Star, Shield, Users, TrendingUp } from "lucide-react";

// ── Testimonial data ────────────────────────────────────────────────────────
const testimonials = [
  { name: "Sarah M.", role: "Marketing Director", text: "My coach helped me land a VP role in 4 months. Completely life-changing.", avatar: "SM", color: "bg-violet-100 text-violet-700" },
  { name: "James K.", role: "Startup Founder", text: "The sessions gave me clarity I'd been searching for years. Worth every cent.", avatar: "JK", color: "bg-sky-100 text-sky-700" },
  { name: "Amara N.", role: "Software Engineer", text: "From imposter syndrome to leading a team of 12. Coaching changed everything.", avatar: "AN", color: "bg-emerald-100 text-emerald-700" },
];

const stats = [
  { n: "2,400+", l: "Coaches" },
  { n: "94%", l: "Success rate" },
  { n: "4.9", l: "Avg. rating" },
  { n: "180+", l: "Specialties" },
];

// ── Floating coach card ──────────────────────────────────────────────────────
function CoachCard({ name, specialty, rate, rating, avatar, color, delay }: {
  name: string; specialty: string; rate: string; rating: number;
  avatar: string; color: string; delay: string;
}) {
  return (
    <div className={`absolute bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-3 animate-float ${delay}`} style={{ width: 220 }}>
      <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center font-bold text-sm shrink-0`}>{avatar}</div>
      <div className="min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{name}</p>
        <p className="text-gray-400 text-xs truncate">{specialty}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="flex gap-0.5">{Array(5).fill(0).map((_,i)=><Star key={i} size={9} className={i<rating?"text-amber-400 fill-amber-400":"text-gray-200 fill-gray-200"}/>)}</div>
          <span className="text-xs font-semibold text-gray-700">{rate}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main sign-in page ────────────────────────────────────────────────────────
export default function SignInPage() {
  const router = useRouter();
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.warning("Please enter your email and password."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/authentication/sign_in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || "Sign in failed. Please try again.");
        setLoading(false);
        return;
      }
      // Handle choose_role state — user exists but no coaching profile yet
      if (json.metadata.role === "choose_role") {
        setLoading(false);
        router.push(`/sign-up?existing=${json.metadata.id}&name=${encodeURIComponent(json.metadata.full_name)}`);
        return;
      }
      setLoading(false);
      setRedirecting(true);
      await signIn("credentials", {
        username: json.metadata.email,
        password: json.metadata.password,
        redirect: true,
        callbackUrl: `/${json.metadata.role}`,
      });
    } catch {
      toast.error("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes floatReverse { 0%,100%{transform:translateY(-8px)} 50%{transform:translateY(0)} }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-reverse { animation: floatReverse 4s ease-in-out infinite; }
        .delay-1 { animation-delay: 0.5s; }
        .delay-2 { animation-delay: 1s; }
        .delay-3 { animation-delay: 1.5s; }
      `}</style>

      <div className="min-h-screen bg-gray-50 flex">

        {/* ── Left: Hero panel ── */}
        <div className="hidden lg:flex flex-col w-[52%] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden px-12 py-14">
          {/* Background texture */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage:"radial-gradient(circle at 20% 50%, white 1px, transparent 1px),radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize:"40px 40px" }}/>
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"/>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-900/30 rounded-full blur-3xl"/>

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white"/>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">CoachLife</span>
          </div>

          {/* Floating coach cards */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <div className="relative w-full h-96">
              <CoachCard name="David Chen" specialty="Executive Coach" rate="50k RWF/session" rating={5} avatar="DC" color="bg-indigo-100 text-indigo-700" delay="animate-float"/>
              <CoachCard name="Priya Sharma" specialty="Career Transition" rate="35k RWF/session" rating={5} avatar="PS" color="bg-rose-100 text-rose-700" delay="animate-float-reverse delay-1"/>
              <CoachCard name="Marcus A." specialty="Leadership & Team" rate="60k RWF/session" rating={5} avatar="MA" color="bg-amber-100 text-amber-700" delay="animate-float delay-2"/>

              {/* Position cards */}
              <style>{`
                div.absolute.animate-float:nth-child(1) { top: 10%; left: 5%; }
                div.absolute.animate-float-reverse { top: 35%; right: 2%; }
                div.absolute.animate-float.delay-2 { bottom: 10%; left: 15%; }
              `}</style>

              {/* Center badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-3xl px-8 py-6 shadow-2xl">
                  <p className="text-white/70 text-sm font-medium mb-1">Transformations happening</p>
                  <p className="text-white text-4xl font-extrabold tracking-tight">Every day</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {Array(5).fill(0).map((_,i)=><Star key={i} size={14} className="text-amber-300 fill-amber-300"/>)}
                    <span className="text-white/80 text-sm ml-1.5">4.9 · 2,400+ coaches</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="relative z-10 grid grid-cols-4 gap-3 mb-8">
            {stats.map(s=>(
              <div key={s.l} className="text-center bg-white/10 backdrop-blur rounded-2xl py-3">
                <p className="text-white font-extrabold text-xl">{s.n}</p>
                <p className="text-white/60 text-xs">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Testimonial carousel */}
          <div className="relative z-10 bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
            <p className="text-white text-sm leading-relaxed mb-4">"{testimonials[activeTestimonial].text}"</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${testimonials[activeTestimonial].color} flex items-center justify-center text-xs font-bold`}>{testimonials[activeTestimonial].avatar}</div>
                <div>
                  <p className="text-white font-semibold text-sm">{testimonials[activeTestimonial].name}</p>
                  <p className="text-white/50 text-xs">{testimonials[activeTestimonial].role}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {testimonials.map((_,i)=>(
                  <button key={i} onClick={()=>setActiveTestimonial(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${activeTestimonial===i?"bg-white w-4":"bg-white/30"}`}/>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Sign-in form ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                <Sparkles size={16} className="text-white"/>
              </div>
              <span className="font-bold text-gray-900 text-lg">CoachLife</span>
            </div>

            {redirecting ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"/>
                <p className="text-gray-500 font-medium">Taking you to your dashboard…</p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h1>
                  <p className="text-gray-400 mt-2">Sign in to continue your coaching journey.</p>
                </div>

                {/* Social proof — mobile */}
                <div className="lg:hidden flex items-center gap-2 mb-6 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                  <div className="flex -space-x-2">{["bg-indigo-400","bg-violet-400","bg-sky-400"].map((c,i)=><div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-white`}/>)}</div>
                  <p className="text-sm text-indigo-700 font-medium">Join 12,000+ people transforming their lives</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                      placeholder="you@example.com"
                      className="w-full h-12 px-4 border-2 border-gray-200 focus:border-indigo-500 rounded-xl outline-none text-gray-900 text-sm transition placeholder:text-gray-400 bg-gray-50 focus:bg-white"/>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Password</label>
                      <Link href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">Forgot password?</Link>
                    </div>
                    <div className="relative">
                      <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required
                        placeholder="Enter your password"
                        className="w-full h-12 px-4 pr-12 border-2 border-gray-200 focus:border-indigo-500 rounded-xl outline-none text-gray-900 text-sm transition placeholder:text-gray-400 bg-gray-50 focus:bg-white"/>
                      <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {showPw?<EyeOff size={18}/>:<Eye size={18}/>}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={loading}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Signing in…</span></>
                    ) : (
                      <><span>Sign in</span><ArrowRight size={16}/></>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-gray-200"/>
                  <span className="text-xs text-gray-400 font-medium">New to CoachLife?</span>
                  <div className="flex-1 h-px bg-gray-200"/>
                </div>

                {/* Sign-up options */}
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/sign-up?role=coachee"
                    className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-2xl transition group">
                    <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-200 transition">
                      <Users size={18} className="text-violet-600"/>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 text-sm">Find a Coach</p>
                      <p className="text-gray-400 text-xs mt-0.5">Start as a coachee</p>
                    </div>
                  </Link>
                  <Link href="/sign-up?role=coach"
                    className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-2xl transition group">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition">
                      <TrendingUp size={18} className="text-indigo-600"/>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 text-sm">Become a Coach</p>
                      <p className="text-gray-400 text-xs mt-0.5">Apply to coach</p>
                    </div>
                  </Link>
                </div>

                {/* Trust */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-5 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5"><Shield size={12} className="text-gray-400"/>Secure & private</span>
                  <span className="flex items-center gap-1.5"><Star size={12} className="text-gray-400"/>4.9 average rating</span>
                  <span className="flex items-center gap-1.5"><Users size={12} className="text-gray-400"/>12k+ members</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
