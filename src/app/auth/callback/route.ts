import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";

// token_hash flow (email template) works across browsers/devices;
// code flow (PKCE, default template) needs the browser that requested the link.
const otpTypeSchema = z.enum(["email", "magiclink"]);

export async function GET(request: NextRequest) {
  // Behind Railway's proxy, the public origin comes from the forwarded headers.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : request.nextUrl.origin;

  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const otpType = otpTypeSchema.safeParse(params.get("type"));
  const code = params.get("code");

  if (!(tokenHash && otpType.success) && !code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } =
    tokenHash && otpType.success
      ? await supabase.auth.verifyOtp({
          type: otpType.data,
          token_hash: tokenHash,
        })
      : await supabase.auth.exchangeCodeForSession(code!);

  if (error) {
    console.error("Auth callback error:", error.message);
    return NextResponse.redirect(`${origin}/login`);
  }

  return NextResponse.redirect(`${origin}/`);
}
