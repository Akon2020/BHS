"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeleteConfirmationModal from "@/components/modals/delete-confirmation-modal";
import { toast } from "@/components/ui/use-toast";
import {
  createGalerie,
  deletePhotoGalerie,
  getGalerieById,
  updateGalerie,
  updatePhotoGalerie,
} from "@/actions/galerie";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { Galerie, PhotoGalerie } from "@/types/user";

const TYPES_ACCEPTES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const TAILLE_MAX = 10 * 1024 * 1024;
const MAX_PAR_ENVOI = 30;

const formVide = {
  titre: "",
  description: "",
  dateActivite: "",
  lieu: "",
  statut: "brouillon",
};

interface Apercu {
  fichier: File;
  url: string;
}

export default function GalerieEditeurPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const estNouveau = id === "nouveau";
  const idGalerie = estNouveau ? null : Number(id);

  const [album, setAlbum] = useState<Galerie | null>(null);
  const [form, setForm] = useState(formVide);
  const [nouvelles, setNouvelles] = useState<Apercu[]>([]);
  const [loading, setLoading] = useState(!estNouveau);
  const [saving, setSaving] = useState(false);
  const [survol, setSurvol] = useState(false);
  const [photoASupprimer, setPhotoASupprimer] = useState<PhotoGalerie | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const charger = useCallback(async () => {
    if (!idGalerie) return;
    try {
      const g = await getGalerieById(idGalerie);
      setAlbum(g);
      setForm({
        titre: g.titre,
        description: g.description || "",
        dateActivite: g.dateActivite || "",
        lieu: g.lieu || "",
        statut: g.statut,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Album introuvable.",
      });
      router.push("/admin/galerie");
    } finally {
      setLoading(false);
    }
  }, [idGalerie, router]);

  useEffect(() => {
    charger();
  }, [charger]);

  // Libère les URL d'aperçu restantes à la sortie de la page.
  const nouvellesRef = useRef(nouvelles);
  nouvellesRef.current = nouvelles;
  useEffect(
    () => () =>
      nouvellesRef.current.forEach((a) => URL.revokeObjectURL(a.url)),
    [],
  );

  const ajouterFichiers = (liste: FileList | null) => {
    if (!liste) return;
    const refuses: string[] = [];
    const valides: Apercu[] = [];
    Array.from(liste).forEach((f) => {
      if (!TYPES_ACCEPTES.includes(f.type)) refuses.push(`${f.name} (format)`);
      else if (f.size > TAILLE_MAX) refuses.push(`${f.name} (> 10 Mo)`);
      else valides.push({ fichier: f, url: URL.createObjectURL(f) });
    });

    const total = [...nouvelles, ...valides];
    if (total.length > MAX_PAR_ENVOI) {
      total.slice(MAX_PAR_ENVOI).forEach((a) => URL.revokeObjectURL(a.url));
      refuses.push(`${total.length - MAX_PAR_ENVOI} image(s) au-delà de 30`);
    }
    setNouvelles(total.slice(0, MAX_PAR_ENVOI));

    if (refuses.length) {
      toast({
        variant: "destructive",
        title: "Certaines images ont été ignorées",
        description: refuses.join(", "),
      });
    }
  };

  const retirerApercu = (url: string) => {
    URL.revokeObjectURL(url);
    setNouvelles((prev) => prev.filter((a) => a.url !== url));
  };

  const enregistrer = async () => {
    if (!form.titre.trim()) {
      toast({
        variant: "destructive",
        title: "Titre requis",
        description: "Donnez un titre à l'album.",
      });
      return;
    }
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("titre", form.titre.trim());
      fd.append("description", form.description.trim());
      fd.append("dateActivite", form.dateActivite);
      fd.append("lieu", form.lieu.trim());
      fd.append("statut", form.statut);
      nouvelles.forEach((a) => fd.append("images", a.fichier));

      if (idGalerie) {
        await updateGalerie(idGalerie, fd);
        toast({ title: "Album enregistré" });
        nouvelles.forEach((a) => URL.revokeObjectURL(a.url));
        setNouvelles([]);
        charger();
      } else {
        const cree = await createGalerie(fd);
        nouvelles.forEach((a) => URL.revokeObjectURL(a.url));
        setNouvelles([]);
        toast({ title: "Album créé" });
        router.replace(`/admin/galerie/${cree.idGalerie}`);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Enregistrement impossible.",
      });
    } finally {
      setSaving(false);
    }
  };

  const definirCouverture = async (photo: PhotoGalerie) => {
    if (!idGalerie) return;
    try {
      const fd = new FormData();
      fd.append("couverture", String(photo.idPhoto));
      await updateGalerie(idGalerie, fd);
      setAlbum((a) => (a ? { ...a, imageCouverture: photo.chemin } : a));
      toast({ title: "Couverture mise à jour" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Mise à jour impossible.",
      });
    }
  };

  const enregistrerLegende = async (photo: PhotoGalerie, legende: string) => {
    if (!idGalerie || (photo.legende || "") === legende.trim()) return;
    try {
      await updatePhotoGalerie(idGalerie, photo.idPhoto, { legende });
      setAlbum((a) =>
        a
          ? {
              ...a,
              photos: a.photos?.map((p) =>
                p.idPhoto === photo.idPhoto
                  ? { ...p, legende: legende.trim() || null }
                  : p,
              ),
            }
          : a,
      );
      toast({ title: "Légende enregistrée" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Enregistrement impossible.",
      });
    }
  };

  const supprimerPhoto = async () => {
    if (!idGalerie || !photoASupprimer) return;
    try {
      await deletePhotoGalerie(idGalerie, photoASupprimer.idPhoto);
      toast({ title: "Photo supprimée" });
      charger();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Suppression impossible.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const photos = album?.photos || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/galerie"
            className="inline-flex min-h-10 items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Retour aux albums
          </Link>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {estNouveau ? "Nouvel album" : form.titre || "Album"}
          </h1>
        </div>
        <div className="flex gap-2">
          {album?.statut === "publie" && (
            <Button asChild variant="outline">
              <Link href={`/galerie/${album.slug}`} target="_blank">
                Voir sur le site
              </Link>
            </Button>
          )}
          <Button onClick={enregistrer} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving
              ? nouvelles.length
                ? "Envoi des photos..."
                : "Enregistrement..."
              : estNouveau
                ? "Créer l'album"
                : "Enregistrer"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="g-titre">
                Titre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="g-titre"
                maxLength={255}
                placeholder="Ex. Retraite des jeunes 2026"
                value={form.titre}
                onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="g-date">Date de l&apos;activité</Label>
                <Input
                  id="g-date"
                  type="date"
                  value={form.dateActivite}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dateActivite: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="g-lieu">Lieu</Label>
                <Input
                  id="g-lieu"
                  maxLength={255}
                  value={form.lieu}
                  onChange={(e) => setForm((f) => ({ ...f, lieu: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="g-description">Description</Label>
              <Textarea
                id="g-description"
                rows={7}
                placeholder="Racontez en quelques lignes ce qu'a été cette activité."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={form.statut}
                onValueChange={(v) => setForm((f) => ({ ...f, statut: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="publie">Publié</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          {/* Zone d'ajout */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ajouter des photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setSurvol(true);
                }}
                onDragLeave={() => setSurvol(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setSurvol(false);
                  ajouterFichiers(e.dataTransfer.files);
                }}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                  survol ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                )}
              >
                <Upload className="h-8 w-8 text-muted-foreground" aria-hidden />
                <p className="mt-3 text-sm font-medium">
                  Glissez vos photos ici
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG, WEBP ou GIF · 10 Mo max par image · 30 par envoi
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => inputRef.current?.click()}
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Choisir des photos
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept={TYPES_ACCEPTES.join(",")}
                  className="sr-only"
                  aria-label="Choisir des photos"
                  onChange={(e) => {
                    ajouterFichiers(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>

              {nouvelles.length > 0 && (
                <div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {nouvelles.length} photo{nouvelles.length > 1 ? "s" : ""}{" "}
                    prête{nouvelles.length > 1 ? "s" : ""} à l&apos;envoi — cliquez sur
                    « {estNouveau ? "Créer l'album" : "Enregistrer"} ».
                  </p>
                  <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                    {nouvelles.map((a) => (
                      <li
                        key={a.url}
                        className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                      >
                        {/* Aperçu local (blob) : next/image n'est pas adapté. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={a.url}
                          alt={a.fichier.name}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => retirerApercu(a.url)}
                          aria-label={`Retirer ${a.fichier.name}`}
                          className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photos existantes */}
          {!estNouveau && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Photos de l&apos;album ({photos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {photos.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Aucune photo pour l&apos;instant.
                  </p>
                ) : (
                  <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {photos.map((photo) => {
                      const estCouverture =
                        album?.imageCouverture === photo.chemin;
                      return (
                        <li key={photo.idPhoto} className="space-y-2">
                          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={mediaUrl(photo.chemin) as string}
                              alt={photo.legende || form.titre}
                              fill
                              sizes="(max-width: 640px) 100vw, 300px"
                              className="object-cover"
                            />
                            {estCouverture && (
                              <Badge className="absolute left-2 top-2 gap-1">
                                <Star className="h-3 w-3 fill-current" aria-hidden />
                                Couverture
                              </Badge>
                            )}
                            <div className="absolute right-2 top-2 flex gap-1">
                              {!estCouverture && (
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className="h-8 w-8"
                                  aria-label="Définir comme couverture"
                                  title="Définir comme couverture"
                                  onClick={() => definirCouverture(photo)}
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="destructive"
                                className="h-8 w-8"
                                aria-label="Supprimer la photo"
                                title="Supprimer la photo"
                                onClick={() => setPhotoASupprimer(photo)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <Input
                            aria-label="Légende de la photo"
                            placeholder="Légende (facultatif)"
                            maxLength={255}
                            defaultValue={photo.legende || ""}
                            onBlur={(e) =>
                              enregistrerLegende(photo, e.target.value)
                            }
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={!!photoASupprimer}
        onClose={() => setPhotoASupprimer(null)}
        onConfirm={supprimerPhoto}
        title="Supprimer cette photo ?"
        description="La photo sera définitivement supprimée de l'album."
      />
    </div>
  );
}
