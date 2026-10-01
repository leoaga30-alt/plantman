"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/auth/supabase";
import { useRouter } from "next/navigation";

export function AuthHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth error:", error);
        return;
      }

      if (data.session) {
        // User has a valid session, redirect to home
        router.push("/");
      }
    };

    handleAuthCallback();
  }, [router]);

  return null;
}
