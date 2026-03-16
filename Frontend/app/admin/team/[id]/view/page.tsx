"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Edit,
  Hash,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { getSingleEquipe } from "@/actions/equipe";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import type { Equipe } from "@/types/user";

export default function TeamMemberViewPage() {
  const params = useParams();
  const router = useRouter();

  const memberId = useMemo(() => {
    const rawId = Number(params?.id);
    return Number.isNaN(rawId) ? null : rawId;
  }, [params?.id]);

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<Equipe | null>(null);

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
        const data = await getSingleEquipe(memberId);
        setMember(data);
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

  const imageSrc = member?.photoProfil
    ? `${process.env.NEXT_PUBLIC_API_URL}/${member.photoProfil}`
    : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-56 lg:col-span-2" />
          <Skeleton className="h-56" />
        </div>
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/team">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Profil du membre</h1>
        </div>

        <Button asChild>
          <Link href={`/admin/team/${member.idEquipe}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-border/70 bg-background shadow-sm">
        <CardContent className="p-0">
          <div className="relative bg-linear-to-r from-primary/90 via-primary/80 to-primary/60 p-8 text-primary-foreground">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />

            <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center">
              <div className="h-28 w-28 overflow-hidden rounded-2xl border-2 border-white/40 bg-white/15 backdrop-blur">
                {imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageSrc}
                    alt={member.nomComplet}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UserRound className="h-12 w-12 text-white/80" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold leading-tight md:text-4xl">
                  {member.nomComplet}
                </h2>
                <p className="text-base text-white/90 md:text-lg">
                  {member.fonction}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-white/20 text-white hover:bg-white/20">
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    Membre d'équipe
                  </Badge>
                  <Badge
                    className={
                      member.actif
                        ? "bg-emerald-500/90 text-white hover:bg-emerald-500/90"
                        : "bg-slate-500/90 text-white hover:bg-slate-500/90"
                    }
                  >
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                    {member.actif ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Biographie</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {member.biographie?.trim()
                ? member.biographie
                : "Aucune biographie enregistrée pour ce membre."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ID</span>
              <span className="font-medium">#{member.idEquipe}</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Hash className="h-3.5 w-3.5" /> Ordre
              </span>
              <span className="font-medium">{member.ordre ?? "-"}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Statut</span>
              <span className="font-medium">
                {member.actif ? "Visible" : "Masqué"}
              </span>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="flex items-center gap-1 text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> Créé le
              </p>
              <p className="font-medium">
                {new Date(member.createdAt).toLocaleString("fr-FR")}
              </p>
            </div>

            <div className="space-y-2">
              <p className="flex items-center gap-1 text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> Dernière mise à jour
              </p>
              <p className="font-medium">
                {new Date(member.updatedAt).toLocaleString("fr-FR")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
