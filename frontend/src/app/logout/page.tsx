"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAccessToken } from "@/lib/auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    clearAccessToken();
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      Logging out...
    </div>
  );
}