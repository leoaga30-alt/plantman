import { Suspense } from "react";
import { AuthCallbackHandler } from "./AuthCallbackHandler";

export const dynamic = "force-dynamic";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Connexion en cours…</p>
        </div>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}
