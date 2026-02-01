"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

import {
  getSingleNewsletter,
  getNewsletterStats,
} from "@/actions/newsletter";
import {
  Newsletter,
  NewsletterStatsResponse,
} from "@/types/user";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import {
  ArrowLeft,
  Mail,
  Users,
  BarChart,
  Clock,
  Calendar,
} from "lucide-react";

export default function ViewNewsletterPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>(); // ✅ SAFE
  const newsletterId = Number(params.id);     // ✅ SAFE

  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [stats, setStats] = useState<NewsletterStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!newsletterId || isNaN(newsletterId)) {
      router.push("/admin/newsletter");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [newsletterData, statsData] = await Promise.all([
          getSingleNewsletter(newsletterId),
          getNewsletterStats(newsletterId),
        ]);

        setNewsletter(newsletterData);
        setStats(statsData);
      } catch (error) {
        router.push("/admin/newsletter");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [newsletterId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!newsletter) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Newsletter non trouvée</h2>
        <p className="text-muted-foreground mt-2">
          La newsletter demandée n'existe pas ou a été supprimée.
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/newsletter">Retour à la liste</Link>
        </Button>
      </div>
    );
  }

  const recipients = stats?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/newsletter">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            {newsletter.titreInterne}
          </h1>
        </div>

        <Badge
          variant={
            newsletter.statut === "envoye"
              ? "default"
              : newsletter.statut === "programme"
              ? "secondary"
              : "outline"
          }
        >
          {newsletter.statut === "envoye"
            ? "Envoyé"
            : newsletter.statut === "programme"
            ? "Programmé"
            : "Brouillon"}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Destinataires</p>
            <p className="text-3xl font-bold">{recipients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Taux de succès</p>
            <p className="text-3xl font-bold">
              {stats?.tauxSucces ?? 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <BarChart className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Échecs</p>
            <p className="text-3xl font-bold">{stats?.echec ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Date d’envoi</p>
            <p className="text-lg font-medium">
              {newsletter.dateEnvoi
                ? new Date(newsletter.dateEnvoi).toLocaleString()
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Contenu de la newsletter</CardTitle>
          <CardDescription>
            Objet : {newsletter.objetMail}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: newsletter.contenu }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
