"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  Clock,
  Download,
  Search,
  CheckCircle,
  Layers,
  Percent,
  ImageIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

import { getSingleEventAdmin } from "@/actions/event";

export default function ViewEventAdminPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const res = await getSingleEventAdmin(id);
        setEvent(res.event);
      } catch (error: any) {
        toast({
          title: "Erreur",
          description:
            error.message || "Impossible de charger les détails de l'événement",
          variant: "destructive",
        });
        router.push("/admin/events");
      } finally {
        setIsLoading(false);
      }
    };

    if (!Number.isNaN(id)) fetchEvent();
  }, [id, router]);

  const totalPlaces = event?.nombrePlaces ?? null;
  const totalInscrits = event?.inscriptions?.length ?? 0;

  const placesRestantes =
    typeof totalPlaces === "number"
      ? Math.max(totalPlaces - totalInscrits, 0)
      : null;

  const tauxRemplissage =
    totalPlaces && totalPlaces > 0
      ? Math.round((totalInscrits / totalPlaces) * 100)
      : null;

  const filteredInscriptions = useMemo(() => {
    if (!event?.inscriptions) return [];

    return event.inscriptions.filter((ins: any) => {
      const q = search.toLowerCase();

      const nom =
        ins.utilisateur?.nomComplet?.toLowerCase() ||
        ins.nomComplet?.toLowerCase() ||
        "";

      const email =
        ins.utilisateur?.email?.toLowerCase() || ins.email?.toLowerCase() || "";

      return nom.includes(q) || email.includes(q);
    });
  }, [event, search]);

  const handleExportPDF = async () => {
    try {
      if (!event) return;

      const doc = new jsPDF("p", "mm", "a4");

      const PRIMARY = [148, 28, 38]; // Rouge Burning Heart
      const TEXT_DARK = [40, 40, 40];
      const MUTED = [120, 120, 120];

      // Charger le logo
      const logoUrl = "/images/logon.png";
      const logoBase64 = await fetch(logoUrl)
        .then((res) => res.blob())
        .then(
          (blob) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            }),
        );

      // === HEADER (sans bandeau rouge) ===
      doc.addImage(logoBase64, "PNG", 95, 12, 20, 20); // centré

      doc.setFontSize(14);
      doc.setTextColor(...TEXT_DARK);
      doc.text("BURNING HEART", 105, 38, { align: "center" });

      doc.setFontSize(10);
      doc.text("PÈLERINS AVEC LE CHRIST", 105, 44, { align: "center" });

      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text("Email : contact@burningheartihs.org", 105, 50, {
        align: "center",
      });
      doc.text("Tél : +243 970 000 000", 105, 55, { align: "center" });
      doc.text("Adresse : Bukavu, RDC", 105, 60, { align: "center" });

      // === TITRE DOCUMENT ===
      doc.setTextColor(...TEXT_DARK);
      doc.setFontSize(14);
      doc.text("Liste des inscrits", 14, 75);

      doc.setFontSize(11);
      doc.text(event.titre, 14, 82);

      doc.setFontSize(10);
      doc.setTextColor(...MUTED);
      doc.text(
        `Événement prévu le : ${new Date(event.dateEvenement).toLocaleDateString("fr-FR")}`,
        14,
        88,
      );

      // === TABLEAU ===
      const rows = filteredInscriptions.map((ins: any, i: number) => [
        i + 1,
        ins.utilisateur?.nomComplet || ins.nomComplet || "-",
        ins.utilisateur?.email || ins.email || "-",
        ins.telephone || "-",
        ins.sexe || "-",
        ins.utilisateur ? "Utilisateur" : "Visiteur",
      ]);

      autoTable(doc, {
        head: [["#", "Nom", "Email", "Téléphone", "Sexe", "Type"]],
        body: rows,
        startY: 95,
        theme: "grid",
        headStyles: {
          fillColor: PRIMARY, // 🔴 Bandeau rouge sur header du tableau
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        bodyStyles: {
          textColor: TEXT_DARK,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        margin: { left: 14, right: 14 },
      });

      // === FOOTER ===
      const pageCount = doc.getNumberOfPages();
      const today = new Date().toLocaleDateString("fr-FR");

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(...MUTED);

        doc.text(`Généré par burningheartihs.org • ${today}`, 14, 290);
        doc.text(`Page ${i} / ${pageCount}`, 190, 290, { align: "right" });
      }

      doc.save(`BHS-Event-${event.slug || event.idEvenement}.pdf`);

      toast({
        title: "Export réussi",
        description: "Le fichier PDF a été généré avec succès",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Erreur export PDF",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/events">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{event.titre}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              placesRestantes === 0 && totalPlaces
                ? "destructive"
                : event.statut === "publie"
                  ? "default"
                  : "secondary"
            }
          >
            {placesRestantes === 0 && totalPlaces ? "Complet" : event.statut}
          </Badge>

          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Infos + Image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-4">
            <p className="text-muted-foreground">{event.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {event.dateEvenement}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {event.heureDebut} - {event.heureFin}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {event.lieu}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            {event.imageEvenement ? (
              <div className="relative aspect-video rounded-md overflow-hidden border">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${event.imageEvenement}`}
                  alt={event.titre}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center border rounded-md text-muted-foreground">
                <ImageIcon className="h-6 w-6 mr-2" />
                Aucune image
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={CheckCircle} label="Statut" value={event.statut} />
        <StatCard
          icon={Layers}
          label="Places max"
          value={totalPlaces ?? "Illimité"}
        />
        <StatCard icon={Users} label="Inscrits" value={totalInscrits} />
        <StatCard
          icon={Users}
          label="Places restantes"
          value={totalPlaces ? placesRestantes : "Illimité"}
          danger={placesRestantes === 0 && totalPlaces}
        />
        <StatCard
          icon={Percent}
          label="Taux de remplissage"
          value={tauxRemplissage !== null ? `${tauxRemplissage}%` : "—"}
        />
      </div>

      {/* Recherche */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Liste */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des inscrits ({filteredInscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="p-3 text-left">Nom</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Téléphone</th>
                  <th className="p-3 text-left">Sexe</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredInscriptions.map((ins: any) => (
                  <tr key={ins.idInscription} className="border-b">
                    <td className="p-3">
                      {ins.utilisateur?.nomComplet || ins.nomComplet || "—"}
                    </td>
                    <td className="p-3">
                      {ins.utilisateur?.email || ins.email || "—"}
                    </td>
                    <td className="p-3">{ins.telephone || "—"}</td>
                    <td className="p-3">{ins.sexe || "—"}</td>
                    <td className="p-3">
                      <Badge
                        variant={ins.utilisateur ? "default" : "secondary"}
                      >
                        {ins.utilisateur ? "Utilisateur" : "Visiteur"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {new Date(ins.dateInscription).toLocaleDateString(
                        "fr-FR",
                      )}
                    </td>
                  </tr>
                ))}
                {filteredInscriptions.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-4 text-center text-muted-foreground"
                    >
                      Aucun inscrit trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  danger,
}: {
  icon: any;
  label: string;
  value: any;
  danger?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <Icon
          className={`h-6 w-6 ${danger ? "text-destructive" : "text-primary"}`}
        />
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={`text-2xl font-bold ${danger ? "text-destructive" : ""}`}
          >
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
