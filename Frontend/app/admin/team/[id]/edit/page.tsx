"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImageIcon, Loader2, Save, Upload } from "lucide-react";

import { getSingleEquipe, updateEquipe } from "@/actions/equipe";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

export default function EditTeamMemberPage() {
  const params = useParams();
  const router = useRouter();

  const memberId = useMemo(() => {
    const rawId = Number(params?.id);
    return Number.isNaN(rawId) ? null : rawId;
  }, [params?.id]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [memberData, setMemberData] = useState({
    name: "",
    role: "",
    bio: "",
    order: 0,
    active: true,
  });

  useEffect(() => {
    if (!memberId) {
      toast({
        title: "Erreur",
        description: "ID membre invalide.",
        variant: "destructive",
      });
      router.push("/admin/team");
      return;
    }

    const fetchMember = async () => {
      try {
        setLoading(true);
        const member = await getSingleEquipe(memberId);

        setMemberData({
          name: member.nomComplet,
          role: member.fonction,
          bio: member.biographie || "",
          order: member.ordre ?? 0,
          active: member.actif,
        });

        setCurrentImageUrl(
          member.photoProfil
            ? `${process.env.NEXT_PUBLIC_API_URL}/${member.photoProfil}`
            : null,
        );
      } catch (error: any) {
        toast({
          title: "Erreur",
          description:
            error.message || "Impossible de charger ce membre de l'équipe.",
          variant: "destructive",
        });
        router.push("/admin/team");
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [memberId, router]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setMemberData((prev) => ({
      ...prev,
      [name]: name === "order" ? Number(value) || 0 : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!memberId) return;

    if (!memberData.name || !memberData.role) {
      toast({
        title: "Erreur",
        description: "Le nom complet et la fonction sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await updateEquipe(memberId, {
        nomComplet: memberData.name,
        fonction: memberData.role,
        biographie: memberData.bio,
        ordre: memberData.order,
        actif: memberData.active,
        photoProfil: imageFile || undefined,
      });

      toast({
        title: "Membre modifié",
        description: "Les informations ont été mises à jour avec succès.",
      });

      router.push("/admin/team");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour ce membre.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-[420px] lg:col-span-2" />
          <Skeleton className="h-[420px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/team">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Modifier un membre</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Enregistrer
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  name="name"
                  value={memberData.name}
                  onChange={handleChange}
                  placeholder="Nom et prénom"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Fonction</Label>
                <Input
                  id="role"
                  name="role"
                  value={memberData.role}
                  onChange={handleChange}
                  placeholder="Ex: Responsable communication"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  rows={6}
                  value={memberData.bio}
                  onChange={handleChange}
                  placeholder="Présentation du membre"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="order">Ordre d'affichage</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    value={String(memberData.order)}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="active">Membre actif</Label>
                  <div className="flex h-10 items-center gap-3 rounded-md border px-3">
                    <Switch
                      id="active"
                      checked={memberData.active}
                      onCheckedChange={(checked) =>
                        setMemberData((prev) => ({ ...prev, active: checked }))
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {memberData.active ? "Visible" : "Masqué"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-medium">Photo de profil</h3>

              <div className="space-y-4">
                <div className="rounded-md border-2 border-dashed p-6 text-center">
                  <div className="mb-4">
                    <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full bg-secondary">
                      {previewUrl || currentImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewUrl || currentImageUrl || ""}
                          alt="Aperçu du membre"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mb-2 text-sm text-muted-foreground">
                    Modifier la photo du membre
                  </p>
                  <p className="mb-4 text-xs text-muted-foreground">
                    JPG, PNG ou GIF.
                  </p>

                  <Input
                    id="photoProfil"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <Label htmlFor="photoProfil" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Parcourir
                    </Label>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
