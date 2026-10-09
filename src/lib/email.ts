import { z } from "zod";

// Sends one email through Resend's REST API (no SDK needed). Never throws: callers get a result.

const ResendErrorSchema = z.object({ message: z.string().optional() });

export type SendResult = { ok: true } | { ok: false; error: string };

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { ok: false, error: "RESEND_API_KEY ou EMAIL_FROM manquant" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const body = ResendErrorSchema.safeParse(await response.json().catch(() => ({})));
      const detail = body.success && body.data.message ? `: ${body.data.message}` : "";
      return { ok: false, error: `Resend ${response.status}${detail}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur réseau" };
  }
}
