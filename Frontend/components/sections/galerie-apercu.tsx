"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CarteAlbum } from "@/components/galerie/carte-album";
import { getGaleriesPublic } from "@/actions/galerie";
import { cn } from "@/lib/utils";
import type { Galerie } from "@/types/user";

/**
 * Bento sur 4 colonnes (desktop) : la 1re tuile occupe 2×2, les suivantes
 * s'élargissent pour que la grille reste pleine quel que soit le nombre d'albums.
 */
const spanTuile = (i: number, total: number) => {
  if (i === 0) {
    return total === 1
      ? "sm:col-span-2 lg:col-span-4 lg:row-span-2"
      : "sm:col-span-2 lg:row-span-2";
  }
  if (total === 2) return "sm:col-span-2 lg:row-span-2";
  if (total === 3) return "sm:col-span-2";
  return cn(i === 3 && "sm:col-span-2");
};

export function GalerieApercuSection() {
  const [albums, setAlbums] = useState<Galerie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGaleriesPublic({ limit: 4 })
      .then((res) => setAlbums(res.galeries || []))
      .catch(() => setAlbums([]))
      .finally(() => setLoading(false));
  }, []);

  // Pas d'album publié : la section ne s'affiche pas sur la home.
  if (!loading && albums.length === 0) return null;

  return (
    <section
      aria-labelledby="galerie-titre"
      className="bg-muted/30 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              En images
            </p>
            <h2
              id="galerie-titre"
              className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Galerie
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Retraites, rencontres, célébrations : revivez nos dernières
              activités.
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2 self-start sm:self-auto">
            <Link href="/galerie">
              Toute la galerie
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
            <Skeleton className="aspect-[4/3] rounded-2xl sm:col-span-2 lg:row-span-2 lg:aspect-auto" />
            <Skeleton className="aspect-[4/3] rounded-2xl" />
            <Skeleton className="aspect-[4/3] rounded-2xl" />
            <Skeleton className="aspect-[4/3] rounded-2xl sm:col-span-2" />
          </div>
        ) : (
          <div className="grid grid-cols-1 auto-rows-[220px] gap-4 sm:grid-cols-2 lg:auto-rows-[240px] lg:grid-cols-4">
            {albums.map((album, i) => (
              <CarteAlbum
                key={album.idGalerie}
                album={album}
                grande={i === 0}
                sizes={
                  i === 0
                    ? "(max-width: 1024px) 100vw, 50vw"
                    : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                }
                className={spanTuile(i, albums.length)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
