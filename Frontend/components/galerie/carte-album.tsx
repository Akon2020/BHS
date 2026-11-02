import Link from "next/link";
import Image from "next/image";
import { Images } from "lucide-react";

import { formatDateCourte, mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { Galerie } from "@/types/user";

interface CarteAlbumProps {
  album: Galerie;
  sizes: string;
  className?: string;
  /** Titre plus grand pour la tuile mise en avant. */
  grande?: boolean;
}

/** Tuile d'album : couverture plein cadre, titre et méta en surimpression. */
export function CarteAlbum({ album, sizes, className, grande }: CarteAlbumProps) {
  const src = mediaUrl(album.imageCouverture);
  const nb = Number(album.nombrePhotos ?? 0);

  return (
    <Link
      href={`/galerie/${album.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={album.titre}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
          <Images className="h-10 w-10 text-primary/40" aria-hidden />
        </div>
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="text-xs font-medium text-white/90">
          {[formatDateCourte(album.dateActivite), nb > 0 && `${nb} photo${nb > 1 ? "s" : ""}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <h3
          className={cn(
            "mt-1 line-clamp-2 font-serif font-bold leading-tight text-white",
            grande ? "text-2xl sm:text-3xl" : "text-lg",
          )}
        >
          {album.titre}
        </h3>
      </div>
    </Link>
  );
}
