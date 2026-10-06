import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-side access to the private photo bucket. Uses the secret key: never import from client code.
export const PHOTO_BUCKET = process.env.SUPABASE_BUCKET || "arrosoir";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/** One-shot upload ticket: the browser then uploads straight to Storage (never through a Server Action). */
export async function createUploadTicket(path: string) {
  const { data, error } = await admin().storage
    .from(PHOTO_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) throw new Error("Impossible de préparer l'envoi de la photo");
  return { bucket: PHOTO_BUCKET, path: data.path, token: data.token };
}

/** Temporary read URL for a single object; null if the object does not exist. */
export async function signPhotoUrl(path: string): Promise<string | null> {
  const { data, error } = await admin().storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  return error || !data ? null : data.signedUrl;
}

/** Temporary read URLs for many objects, keyed by path. Missing objects are left out. */
export async function signPhotoUrls(
  paths: (string | null | undefined)[]
): Promise<Map<string, string>> {
  const unique = [...new Set(paths.filter((p): p is string => Boolean(p)))];
  const urls = new Map<string, string>();
  if (unique.length === 0) return urls;

  const { data } = await admin().storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(unique, SIGNED_URL_TTL_SECONDS);
  for (const item of data ?? []) {
    if (item.path && item.signedUrl && !item.error) urls.set(item.path, item.signedUrl);
  }
  return urls;
}

export async function removePhotos(paths: string[]) {
  if (paths.length === 0) return;
  await admin().storage.from(PHOTO_BUCKET).remove(paths);
}
