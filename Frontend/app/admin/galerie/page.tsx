"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Images, Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DeleteConfirmationModal from "@/components/modals/delete-confirmation-modal";
import { toast } from "@/components/ui/use-toast";
import { deleteGalerie, getGaleries } from "@/actions/galerie";
import { formatDateCourte, mediaUrl } from "@/lib/media";
import type { Galerie } from "@/types/user";

export default function GalerieAdminPage() {
  const [albums, setAlbums] = useState<Galerie[]>([]);
  const [loading, setLoading] = useState(true);
  const [aSupprimer, setASupprimer] = useState<Galerie | null>(null);

  const charger = async () => {
    try {
      setLoading(true);
      const res = await getGaleries();
      setAlbums(res.galeries);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Chargement impossible.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    charger();
  }, []);

  const supprimer = async () => {
    if (!aSupprimer) return;
    try {
      await deleteGalerie(aSupprimer.idGalerie);
      toast({ title: "Album supprimé" });
      charger();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Suppression impossible.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Galerie</h1>
          <p className="text-sm text-muted-foreground">
            Un album par activité : photos et texte de présentation.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/galerie/nouveau">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel album
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : albums.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Images className="h-10 w-10 text-primary/50" aria-hidden />
            <p className="mt-4 font-medium">Aucun album pour l&apos;instant</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Créez le premier album pour alimenter la galerie du site.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {albums.map((album) => {
            const src = mediaUrl(album.imageCouverture);
            const nb = Number(album.nombrePhotos ?? 0);
            return (
              <li key={album.idGalerie}>
                <Card className="h-full overflow-hidden">
                  <div className="relative aspect-[16/10] bg-muted">
                    {src ? (
                      <Image
                        src={src}
                        alt={album.titre}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Images
                          className="h-10 w-10 text-muted-foreground/50"
                          aria-hidden
                        />
                      </div>
                    )}
                    <Badge
                      className="absolute left-3 top-3"
                      variant={album.statut === "publie" ? "default" : "secondary"}
                    >
                      {album.statut === "publie" ? "Publié" : "Brouillon"}
                    </Badge>
                  </div>
                  <CardContent className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-semibold leading-snug">
                        {album.titre}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {[
                          formatDateCourte(album.dateActivite),
                          `${nb} photo${nb > 1 ? "s" : ""}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button asChild size="icon" variant="ghost">
                        <Link
                          href={`/admin/galerie/${album.idGalerie}`}
                          aria-label={`Modifier ${album.titre}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        aria-label={`Supprimer ${album.titre}`}
                        onClick={() => setASupprimer(album)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <DeleteConfirmationModal
        isOpen={!!aSupprimer}
        onClose={() => setASupprimer(null)}
        onConfirm={supprimer}
        title="Supprimer cet album ?"
        description="L'album et toutes ses photos seront définitivement supprimés."
      />
    </div>
  );
}
