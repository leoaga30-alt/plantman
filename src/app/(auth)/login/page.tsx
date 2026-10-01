"use client";

import { useState } from "react";

export const dynamic = "force-dynamic";
import { supabase } from "@/lib/auth/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        setError(
          error.message === "User not found"
            ? "Cet email n'est pas autorisé."
            : error.message
        );
        return;
      }

      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Arrosoir 🌿</h1>
          <p className="text-sm text-muted-foreground">
            Gestion des plantes du foyer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@exemple.be"
              disabled={loading}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? "Envoi du code..." : "Envoyer un code"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Vous recevrez un code à 6 chiffres par email.
        </p>
      </div>
    </div>
  );
}
