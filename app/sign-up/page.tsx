import { Suspense } from "react";
import Signup from "@/components/auth/register";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coaching - Peoplematters",
  description: "Coaching peoplematters",
};

export default function Widget() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Signup />
      </Suspense>
    </div>
  );
}