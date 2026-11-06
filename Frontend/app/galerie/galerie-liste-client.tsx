"use client";

import { useEffect, useState } from "react";
import { Images, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CarteAlbum } from "@/components/galerie/carte-album";
import { getGaleriesPublic } from "@/actions/galerie";
import type { Galerie } from "@/types/user";

const PAR_PAGE = 12;

export default function GalerieListeClient() {
  const [albums, setAlbums] = useState<Galerie[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [chargementSuite, setChargementSuite] = useState(false);
  const [erreur, setErreur] = useState(false);
  const [tentative, setTentative] = useState(0);

  useEffect(() => {
    const charger = async () => {
      try {
        if (page === 1) setLoading(true);
        else setChargementSuite(true);
        const res = await getGaleriesPublic({ page, limit: PAR_PAGE });
        setAlbums((prev) =>
          page === 1 ? res.galeries : [...prev, ...res.galeries],
        );
        setPages(res.pages || 1);
        setErreur(false);
      } catch {
        setErreur(true);
      } finally {
        setLoading(false);
        setChargementSuite(false);
      }
    };
    charger();
  }, [page, tentative]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <section className="bg-gradient-to-b from-muted/40 to-background py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Galerie
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Retraites, rencontres, célébrations : quelques images de la vie de
            la communauté, de la plus récente à la plus ancienne.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        ) : erreur && albums.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">
              Impossible de charger la galerie pour le moment.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setTentative((t) => t + 1)}
            >
              Réessayer
            </Button>
          </div>
        ) : albums.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Images className="h-12 w-12 text-primary/50" aria-hidden />
            <p className="mt-4 font-serif text-xl font-semibold">
              Aucun album pour l&apos;instant
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Les photos de nos prochaines activités arriveront bientôt.
            </p>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => (
                <li key={album.idGalerie}>
                  <CarteAlbum
                    album={album}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="aspect-[4/3]"
                  />
                  {album.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {album.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            {page < pages && (
              <div className="mt-12 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  disabled={chargementSuite}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {chargementSuite && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  )}
                  Voir plus d&apos;albums
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
