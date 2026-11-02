"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateLongue, mediaUrl } from "@/lib/media";
import type { Galerie } from "@/types/user";

export default function AlbumClient({ album }: { album: Galerie }) {
  const photos = album.photos || [];
  const [index, setIndex] = useState<number | null>(null);

  const precedente = useCallback(
    () =>
      setIndex((i) =>
        i === null ? i : (i - 1 + photos.length) % photos.length,
      ),
    [photos.length],
  );
  const suivante = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length],
  );

  // Navigation clavier dans la visionneuse.
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") precedente();
      if (e.key === "ArrowRight") suivante();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, precedente, suivante]);

  const courante = index !== null ? photos[index] : null;

  return (
    <div className="flex-1">
      <section className="mx-auto max-w-4xl px-4 pb-10 pt-12 md:pt-16">
        <Link
          href="/galerie"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Toute la galerie
        </Link>
        <h1 className="mt-4 text-balance font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          {album.titre}
        </h1>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {album.dateActivite && (
            <span className="inline-flex items-center gap-1.5 capitalize">
              <CalendarDays className="h-4 w-4" aria-hidden />
              {formatDateLongue(album.dateActivite)}
            </span>
          )}
          {album.lieu && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden />
              {album.lieu}
            </span>
          )}
        </div>
        {album.description && (
          <p className="mt-6 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
            {album.description}
          </p>
        )}
      </section>

      <section
        aria-label="Photos de l'album"
        className="mx-auto max-w-7xl px-4 pb-20 lg:px-8"
      >
        {photos.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            Les photos de cet album arrivent bientôt.
          </p>
        ) : (
          <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {photos.map((photo, i) => {
              const src = mediaUrl(photo.chemin);
              if (!src) return null;
              return (
                <li key={photo.idPhoto} className="mb-4 break-inside-avoid">
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    className="group block w-full overflow-hidden rounded-xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={`Agrandir la photo ${i + 1}${photo.legende ? ` : ${photo.legende}` : ""}`}
                  >
                    <Image
                      src={src}
                      alt={photo.legende || `${album.titre} — photo ${i + 1}`}
                      width={800}
                      height={600}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
                    />
                  </button>
                  {photo.legende && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {photo.legende}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Visionneuse */}
      <Dialog open={index !== null} onOpenChange={(o) => !o && setIndex(null)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[calc(100%-1rem)] border-none bg-black/95 p-0 text-white sm:max-w-6xl"
        >
          <DialogTitle className="sr-only">
            {album.titre} — photo {index !== null ? index + 1 : ""} sur{" "}
            {photos.length}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Utilisez les flèches gauche et droite pour naviguer.
          </DialogDescription>
          {courante && (
            <div className="relative">
              <div className="relative h-[75vh] w-full">
                <Image
                  src={mediaUrl(courante.chemin) as string}
                  alt={courante.legende || `${album.titre} — photo ${(index ?? 0) + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <p className="min-w-0 truncate text-white/85">
                  {courante.legende || album.titre}
                </p>
                <p className="shrink-0 tabular-nums text-white/70">
                  {(index ?? 0) + 1} / {photos.length}
                </p>
              </div>
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={precedente}
                    aria-label="Photo précédente"
                    className="absolute left-2 top-[37.5vh] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={suivante}
                    aria-label="Photo suivante"
                    className="absolute right-2 top-[37.5vh] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setIndex(null)}
                aria-label="Fermer la visionneuse"
                className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
