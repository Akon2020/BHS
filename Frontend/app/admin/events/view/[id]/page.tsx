"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
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
  Send,
  Trash2,
  UserPlus,
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

import {
  addVisitorToEventAdmin,
  getSingleEventAdmin,
  removeSelectedDuplicateEventInscriptions,
  resendEventTicket,
} from "@/actions/event";
import type { EvenementAdmin, InscriptionEvenement, Sexe } from "@/types/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ViewEventAdminPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [event, setEvent] = useState<EvenementAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [addVisitorOpen, setAddVisitorOpen] = useState(false);
  const [duplicatesOpen, setDuplicatesOpen] = useState(false);

  const [isAddingVisitor, setIsAddingVisitor] = useState(false);
  const [isRemovingSelectedDuplicates, setIsRemovingSelectedDuplicates] =
    useState(false);
  const [resendingForId, setResendingForId] = useState<number | null>(null);

  const [visitorData, setVisitorData] = useState<{
    nomComplet: string;
    email: string;
    sexe: Sexe;
    telephone: string;
  }>({
    nomComplet: "",
    email: "",
    sexe: "homme",
    telephone: "",
  });

  const [selectedDuplicateIds, setSelectedDuplicateIds] = useState<number[]>(
    [],
  );

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

  useEffect(() => {
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

    return event.inscriptions.filter((ins: InscriptionEvenement) => {
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

  const duplicateCandidates = useMemo(() => {
    if (!event?.inscriptions?.length) return [] as InscriptionEvenement[];

    const groupedByEmail = new Map<string, InscriptionEvenement[]>();

    [...event.inscriptions]
      .sort(
        (a, b) =>
          new Date(a.dateInscription).getTime() -
          new Date(b.dateInscription).getTime(),
      )
      .forEach((ins) => {
        const normalizedEmail = (ins.email || "").trim().toLowerCase();
        if (!normalizedEmail) return;

        const list = groupedByEmail.get(normalizedEmail) || [];
        list.push(ins);
        groupedByEmail.set(normalizedEmail, list);
      });

    const duplicates: InscriptionEvenement[] = [];
    groupedByEmail.forEach((list) => {
      if (list.length > 1) {
        duplicates.push(...list.slice(1));
      }
    });

    return duplicates;
  }, [event]);

  const duplicateCount = duplicateCandidates.length;

  useEffect(() => {
    if (!duplicatesOpen) {
      setSelectedDuplicateIds([]);
      return;
    }

    setSelectedDuplicateIds(
      duplicateCandidates.map((ins) => ins.idInscription),
    );
  }, [duplicatesOpen, duplicateCandidates]);

  const toggleDuplicateSelection = (idInscription: number) => {
    setSelectedDuplicateIds((prev) =>
      prev.includes(idInscription)
        ? prev.filter((id) => id !== idInscription)
        : [...prev, idInscription],
    );
  };

  const handleAddVisitor = async () => {
    if (!event) return;

    if (
      !visitorData.nomComplet.trim() ||
      !visitorData.email.trim() ||
      !visitorData.telephone.trim()
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs du visiteur.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingVisitor(true);
      await addVisitorToEventAdmin(event.idEvenement, {
        nomComplet: visitorData.nomComplet.trim(),
        email: visitorData.email.trim(),
        sexe: visitorData.sexe,
        telephone: visitorData.telephone.trim(),
      });

      toast({
        title: "Visiteur inscrit",
        description: "Le visiteur a été ajouté et son ticket envoyé.",
      });

      setVisitorData({
        nomComplet: "",
        email: "",
        sexe: "homme",
        telephone: "",
      });

      setAddVisitorOpen(false);
      await fetchEvent();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error.message || "Impossible d'ajouter ce visiteur à l'événement.",
        variant: "destructive",
      });
    } finally {
      setIsAddingVisitor(false);
    }
  };

  const handleResendTicket = async (inscriptionId: number) => {
    if (!event) return;

    try {
      setResendingForId(inscriptionId);
      const res = await resendEventTicket(event.idEvenement, inscriptionId);
      toast({
        title: "Ticket renvoyé",
        description: res.message,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de renvoyer le ticket.",
        variant: "destructive",
      });
    } finally {
      setResendingForId(null);
    }
  };

  const handleRemoveSelectedDuplicates = async () => {
    if (!event) return;

    if (selectedDuplicateIds.length === 0) {
      toast({
        title: "Aucune sélection",
        description: "Sélectionnez au moins un doublon à supprimer.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRemovingSelectedDuplicates(true);
      const res = await removeSelectedDuplicateEventInscriptions(
        event.idEvenement,
        selectedDuplicateIds,
      );
      toast({
        title: "Nettoyage terminé",
        description: res.message,
      });
      setDuplicatesOpen(false);
      await fetchEvent();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error.message || "Impossible de supprimer les doublons sélectionnés.",
        variant: "destructive",
      });
    } finally {
      setIsRemovingSelectedDuplicates(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      if (!event) return;

      const doc = new jsPDF("p", "mm", "a4");

      const PRIMARY: [number, number, number] = [148, 28, 38];
      const TEXT_DARK: [number, number, number] = [40, 40, 40];
      const MUTED: [number, number, number] = [120, 120, 120];

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

      const eventUrl = `${window.location.origin}/events/${event.slug || event.idEvenement}`;
      const qrBase64 = await QRCode.toDataURL(eventUrl, {
        margin: 1,
        width: 300,
        color: {
          dark: "#941C26",
          light: "#FFFFFF",
        },
      });

      doc.addImage(logoBase64, "PNG", 95, 12, 20, 20);
      doc.addImage(qrBase64, "PNG", 175, 12, 18, 18);

      doc.setFontSize(14);
      doc.setTextColor(...TEXT_DARK);
      doc.text("BURNING HEART", 105, 38, { align: "center" });

      doc.setFontSize(10);
      doc.text("PÈLERINS AVEC LE CHRIST", 105, 44, { align: "center" });

      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text("Email : burningheartihs@gmail.com", 105, 50, {
        align: "center",
      });
      doc.text("Tél : +243 849 005 240", 105, 55, { align: "center" });
      doc.text(
        "Adresse : 259 Avenue Patrice Emery Lumumba, Q. Nyalukemba, Bukavu",
        105,
        60,
        { align: "center" },
      );

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

      const rows = filteredInscriptions.map((ins, i: number) => [
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
          fillColor: PRIMARY,
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
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="relative p-0">
          <div className="bg-linear-to-r from-primary/95 via-primary/90 to-primary/70 p-6 text-primary-foreground md:p-7">
            <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_60%)]" />

            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    asChild
                    className="h-8 w-8 bg-white/20 text-white hover:bg-white/30"
                  >
                    <Link href="/admin/events">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Badge className="bg-white/20 text-white hover:bg-white/20">
                    Gestion admin
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold md:text-3xl">
                  {event.titre}
                </h1>
                <p className="text-sm text-white/85">
                  Consultez les inscrits, gérez les doublons et réexpédiez les
                  tickets.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={
                    placesRestantes === 0 && totalPlaces
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-white/20 text-white"
                  }
                >
                  {placesRestantes === 0 && totalPlaces
                    ? "Complet"
                    : event.statut}
                </Badge>

                <Button
                  variant="secondary"
                  onClick={handleExportPDF}
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exporter PDF
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-4">
            <div
              className="text-muted-foreground break-words [&_img]:h-auto [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
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
          danger={Boolean(totalPlaces && placesRestantes === 0)}
        />
        <StatCard
          icon={Percent}
          label="Taux de remplissage"
          value={tauxRemplissage !== null ? `${tauxRemplissage}%` : "—"}
        />
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/25">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 flex items-center gap-6">
              <CardTitle>
                Liste des inscrits ({filteredInscriptions.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-full md:w-[320px]"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:self-end">
              <Button variant="default" onClick={() => setAddVisitorOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter une inscription
              </Button>
              <Button
                variant="outline"
                onClick={() => setDuplicatesOpen(true)}
                className="relative"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer doublons
                {duplicateCount > 0 && (
                  <Badge className="ml-2 h-5 min-w-5 justify-center rounded-full px-1 text-xs">
                    {duplicateCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/15 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-3 text-left">Nom</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Téléphone</th>
                  <th className="p-3 text-left">Sexe</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Date et heure</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInscriptions.map((ins: InscriptionEvenement) => (
                  <tr
                    key={ins.idInscription}
                    className="border-b transition-colors hover:bg-muted/30"
                  >
                    <td className="p-3 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {(
                            ins.utilisateur?.nomComplet ||
                            ins.nomComplet ||
                            "?"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                        <span>
                          {ins.utilisateur?.nomComplet || ins.nomComplet || "—"}
                        </span>
                      </div>
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
                      {new Date(ins.dateInscription).toLocaleString("fr-FR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResendTicket(ins.idInscription)}
                        disabled={resendingForId === ins.idInscription}
                      >
                        {resendingForId === ins.idInscription ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Renvoyer ticket
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredInscriptions.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
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

      <Dialog open={addVisitorOpen} onOpenChange={setAddVisitorOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Ajouter une inscription visiteur</DialogTitle>
            <DialogDescription>
              Complétez le formulaire pour inscrire un nouveau visiteur à cet
              événement.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <Input
              placeholder="Nom complet"
              value={visitorData.nomComplet}
              onChange={(e) =>
                setVisitorData((prev) => ({
                  ...prev,
                  nomComplet: e.target.value,
                }))
              }
            />
            <Input
              type="email"
              placeholder="Email"
              value={visitorData.email}
              onChange={(e) =>
                setVisitorData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <Input
              placeholder="Téléphone"
              value={visitorData.telephone}
              onChange={(e) =>
                setVisitorData((prev) => ({
                  ...prev,
                  telephone: e.target.value,
                }))
              }
            />
            <Select
              value={visitorData.sexe}
              onValueChange={(value: Sexe) =>
                setVisitorData((prev) => ({ ...prev, sexe: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sexe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="homme">Homme</SelectItem>
                <SelectItem value="femme">Femme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddVisitorOpen(false)}
              disabled={isAddingVisitor}
            >
              Annuler
            </Button>
            <Button onClick={handleAddVisitor} disabled={isAddingVisitor}>
              {isAddingVisitor ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Inscrire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={duplicatesOpen} onOpenChange={setDuplicatesOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Suppression des doublons</DialogTitle>
            <DialogDescription>
              {duplicateCount > 0
                ? `${duplicateCount} doublon(s) détecté(s). Sélectionnez ceux à supprimer.`
                : "Aucun doublon dans la liste."}
            </DialogDescription>
          </DialogHeader>

          {duplicateCount === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Aucun doublon trouvé.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="p-3 text-left">Sélection</th>
                    <th className="p-3 text-left">Nom</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Date et heure</th>
                  </tr>
                </thead>
                <tbody>
                  {duplicateCandidates.map((ins) => {
                    const selected = selectedDuplicateIds.includes(
                      ins.idInscription,
                    );
                    return (
                      <tr
                        key={ins.idInscription}
                        className={`cursor-pointer border-b hover:bg-muted/40 ${
                          selected ? "bg-muted/50" : ""
                        }`}
                        onClick={() =>
                          toggleDuplicateSelection(ins.idInscription)
                        }
                      >
                        <td
                          className="p-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selected}
                            onCheckedChange={() =>
                              toggleDuplicateSelection(ins.idInscription)
                            }
                          />
                        </td>
                        <td className="p-3">{ins.nomComplet}</td>
                        <td className="p-3">{ins.email}</td>
                        <td className="p-3">
                          {new Date(ins.dateInscription).toLocaleString(
                            "fr-FR",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDuplicatesOpen(false)}
              disabled={isRemovingSelectedDuplicates}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveSelectedDuplicates}
              disabled={
                duplicateCount === 0 ||
                selectedDuplicateIds.length === 0 ||
                isRemovingSelectedDuplicates
              }
            >
              {isRemovingSelectedDuplicates ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Supprimer la sélection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
