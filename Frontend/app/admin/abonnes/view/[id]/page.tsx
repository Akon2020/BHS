"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Mail, Search, User, Send } from "lucide-react";

import { getSingleAbonne, type Abonne } from "@/actions/abonne";
import type { AbonneReception } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";

type ReceptionStatutFilter = "all" | "envoye" | "echec" | "attente";

export default function ViewAbonnePage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [abonne, setAbonne] = useState<
    (Abonne & { receptions?: AbonneReception[] }) | null
  >(null);
  const [totalReceptions, setTotalReceptions] = useState(0);
  const [totalRecues, setTotalRecues] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] =
    useState<ReceptionStatutFilter>("all");

  const fetchAbonne = async () => {
    try {
      setIsLoading(true);

      const res = await getSingleAbonne(id);
      setAbonne(res.abonne);
      setTotalReceptions(res.stats.totalReceptions);
      setTotalRecues(res.stats.totalRecues);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger cet abonné.",
        variant: "destructive",
      });
      router.push("/admin/abonnes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(id)) fetchAbonne();
  }, [id]);

  const filteredReceptions = useMemo(() => {
    if (!abonne?.receptions) return [];

    const q = search.toLowerCase().trim();
    return abonne.receptions.filter((reception) => {
      const titre = reception.newsletter?.titreInterne?.toLowerCase() || "";
      const objet = reception.newsletter?.objetMail?.toLowerCase() || "";

      const matchSearch = titre.includes(q) || objet.includes(q);
      const matchStatut =
        statutFilter === "all" ? true : reception.statut === statutFilter;

      return matchSearch && matchStatut;
    });
  }, [abonne, search, statutFilter]);

  const getReceptionBadge = (statut: string) => {
    if (statut === "envoye") return <Badge variant="default">Envoyé</Badge>;
    if (statut === "echec") return <Badge variant="destructive">Échec</Badge>;
    return <Badge variant="outline">Attente</Badge>;
  };

  const getAbonneBadge = (statut: string) => {
    if (statut === "actif") return <Badge variant="default">Actif</Badge>;
    if (statut === "inactif") return <Badge variant="outline">Inactif</Badge>;
    return <Badge variant="secondary">Désabonné</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!abonne) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold">Abonné introuvable</h2>
        <p className="mt-2 text-muted-foreground">
          Cet abonné n'existe pas ou a été supprimé.
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/abonnes">Retour à la liste</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/abonnes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Détail de l'abonné</h1>
        </div>

        {getAbonneBadge(abonne.statut)}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              Nom complet
            </p>
            <p className="text-lg font-semibold">{abonne.nomComplet}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              Email
            </p>
            <p className="text-lg font-semibold">{abonne.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Send className="h-4 w-4" />
              Newsletters déjà reçues
            </p>
            <p className="text-lg font-semibold">{totalRecues}</p>
            <p className="text-xs text-muted-foreground">
              Tentatives totales : {totalReceptions}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Traçabilité des envois ({filteredReceptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre ou objet..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={statutFilter}
              onValueChange={(value: ReceptionStatutFilter) =>
                setStatutFilter(value)
              }
            >
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="envoye">Envoyés</SelectItem>
                <SelectItem value="echec">Échecs</SelectItem>
                <SelectItem value="attente">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Newsletter</TableHead>
                  <TableHead>Objet</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date d'envoi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceptions.map((reception) => (
                  <TableRow key={reception.idNewsletterAbonne}>
                    <TableCell className="font-medium">
                      {reception.newsletter?.titreInterne || "-"}
                    </TableCell>
                    <TableCell>
                      {reception.newsletter?.objetMail || "-"}
                    </TableCell>
                    <TableCell>{getReceptionBadge(reception.statut)}</TableCell>
                    <TableCell>
                      {reception.dateEnvoi
                        ? new Date(reception.dateEnvoi).toLocaleString("fr-FR")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}

                {filteredReceptions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Aucune trace d'envoi trouvée.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
