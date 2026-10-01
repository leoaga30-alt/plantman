"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/auth/supabase";
import { useRouter, useSearchParams } from "next/navigation";

export function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        searchParams.get("code") || ""
      );

      if (error) {
        console.error("Auth callback error:", error);
        router.push("/login");
        return;
      }

      router.push("/");
    };

    if (searchParams.get("code")) {
      handleCallback();
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Connexion en cours…</p>
    </div>
  );
}
