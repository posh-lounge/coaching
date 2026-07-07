"use client";
import React, { useState } from "react";
import { Layers, Sparkles, Award } from "lucide-react";
import CoachDashboard from "./dashboard-page";
import CoacheeDashboard from "@/components/coachee/dashboard-page";
import CoachGrowthPage from "./growth-page";

export default function DualDashboardPage() {
  const [tab, setTab] = useState<"coach" | "coachee" | "growth">("coach");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
            <Layers size={20} className="text-indigo-600"/>
            <span className="font-bold text-gray-900">Dual View</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setTab("coach")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${tab === "coach" ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              <Award size={15}/>As Coach
            </button>
            <button onClick={() => setTab("coachee")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${tab === "coachee" ? "bg-violet-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              <Sparkles size={15}/>As Coachee
            </button>
            <button onClick={() => setTab("growth")} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${tab === "growth" ? "bg-emerald-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              📓 My Growth
            </button>
          </div>
          <p className="ml-auto text-xs text-gray-400">You are both a coach and a coachee</p>
        </div>
      </div>

      {/* Content */}
      {tab === "coach"   && <CoachDashboard/>}
      {tab === "coachee" && <CoacheeDashboard/>}
      {tab === "growth"  && <CoachGrowthPage/>}
    </div>
  );
}
