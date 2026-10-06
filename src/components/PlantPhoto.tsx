"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlantThumb } from "@/components/PlantThumb";
import { supabase } from "@/lib/auth/supabase";
import { compressImage } from "@/lib/image-compress";
import { confirmPhotoUpload, requestPhotoUpload } from "@/app/actions/photos";

type Status = "idle" | "compressing" | "uploading" | "saving";

const STATUS_LABEL: Record<Status, string> = {
  idle: "",
  compressing: "Préparation de la photo…",
  uploading: "Envoi de la photo…",
  saving: "Enregistrement…",
};

interface PlantPhotoProps {
  plantId: string;
  plantName: string;
  initialUrl: string | null;
}

export function PlantPhoto({ plantId, plantName, initialUrl }: PlantPhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const busy = status !== "idle";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again
    if (!file) return;

    setError(null);
    try {
      if (!file.type.startsWith("image/")) {
        setError("Ce fichier n'est pas une image.");
        return;
      }

      setStatus("compressing");
      const { blob, ext } = await compressImage(file);

      // The image goes straight to Storage with a one-shot signed URL, never through a Server Action.
      setStatus("uploading");
      const ticket = await requestPhotoUpload(plantId, ext);
      const { error: uploadError } = await supabase.storage
        .from(ticket.bucket)
        .uploadToSignedUrl(ticket.path, ticket.token, blob, {
          contentType: blob.type,
        });
      if (uploadError) throw uploadError;

      setStatus("saving");
      const saved = await confirmPhotoUpload(plantId, ticket.path);
      setUrl(saved.url);
    } catch (err) {
      console.error("Photo upload failed:", err);
      setError("L'envoi de la photo a échoué. Réessayez.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="space-y-3">
      <PlantThumb
        url={url}
        alt={url ? `Photo de ${plantName}` : ""}
        className="aspect-[4/3] w-full max-w-sm rounded-xl"
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={busy}
        className="hidden"
        aria-label={`Choisir une photo pour ${plantName}`}
      />
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="h-11 touch-manipulation px-4 text-base"
      >
        <Camera aria-hidden="true" />
        {url ? "Changer la photo" : "Ajouter une photo"}
      </Button>

      <p role="status" aria-live="polite" className="min-h-5 text-sm text-muted-foreground">
        {STATUS_LABEL[status]}
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
