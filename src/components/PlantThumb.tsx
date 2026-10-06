import { Sprout } from "lucide-react";

interface PlantThumbProps {
  url: string | null | undefined;
  /** Leave empty when the plant name is already written next to the photo. */
  alt?: string;
  className?: string;
}

// Plant photo with a leaf placeholder, so lists keep the same rhythm with or without a photo.
export function PlantThumb({ url, alt = "", className = "" }: PlantThumbProps) {
  return (
    <div className={`overflow-hidden bg-muted text-muted-foreground ${className}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} loading="lazy" className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center">
          <Sprout aria-hidden="true" className="size-1/3 min-h-5 min-w-5 opacity-60" />
        </div>
      )}
    </div>
  );
}
