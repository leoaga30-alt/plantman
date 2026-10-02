import { createBrowserClient } from "@supabase/ssr";

// Cookie-based session (PKCE): readable by middleware and server components.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
