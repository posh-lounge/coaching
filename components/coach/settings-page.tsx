"use client";
import React from "react";
import CoachProfilePage from "./profile-page";

// Settings is a superset of Profile — reuse the full profile page
// with settings-specific title framing
export default function CoachSettingsPage() {
  return <CoachProfilePage/>;
}
