

"use client";
import React, { useState } from "react";
import { Search, Shield, Star, Sparkles, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAdminCoachees,  useAdminAction, useAdminFinances } from "@/lib/api/v1/hooks";

const fmt = (n: number) => `${Number(n || 0).toLocaleString()} RWF`;

// ─── DISPUTES PAGE ────────────────────────────────────────────
export default function AdminDisputesPage() {
  const { data, isLoading } = useAdminFinances(); // reuse admin dashboard data
  const action = useAdminAction();
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Disputes</h1></div>
        {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400"/></div>
        : <p className="text-gray-400">Use the Admin Dashboard disputes tab for full dispute management.</p>}
      </div>
    </div>
  );
}