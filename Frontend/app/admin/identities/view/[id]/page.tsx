"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Trash2,
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

import {
  getIdentityById,
  deleteIdentity,
  approveIdentity,
} from "@/actions/identity";
import type { FicheIdentite } from "@/types/user";

export default function ViewIdentityAdminPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [identity, setIdentity] = useState<FicheIdentite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchIdentity = async () => {
    try {
      setIsLoading(true);
      const res = await getIdentityById(id);
      setIdentity(res.ficheIdentiteInfo);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error.message || "Impossible de charger les détails de l'identité",
        variant: "destructive",
      });
      router.push("/admin/identities");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(id)) fetchIdentity();
  }, [id, router]);

  const handleApprove = async () => {
    if (!identity) return;

    try {
      setIsApproving(true);
      await approveIdentity(identity.idFicheIdentite);
      setIdentity({ ...identity, approuve: true, lu: true });

      toast({
        title: "Succès",
        description: "Fiche d'identité approuvée avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'approuver la fiche",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!identity) return;

    try {
      setIsDownloading(true);
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

      const qrBase64 = await QRCode.toDataURL(
        `${window.location.origin}/admin/identities/view/${identity.idFicheIdentite}`,
        {
          margin: 1,
          width: 300,
          color: {
            dark: "#941C26",
            light: "#FFFFFF",
          },
        },
      );

      // Header avec logo et QR code
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

      // Titre principal
      doc.setTextColor(...PRIMARY);
      doc.setFontSize(14);
      doc.text(
        `Fiche d'Identité N° FID-${identity.idFicheIdentite.toString().padStart(3, "0")}`,
        14,
        75,
        { align: "center" },
      );

      const nomComplet = `${identity.nom} ${identity.postnom} ${identity.prenom}`;

      doc.setFontSize(11);
      doc.text(nomComplet, 14, 82);

      doc.setFontSize(10);
      doc.setTextColor(...MUTED);
      doc.text(
        `Soumise le : ${new Date(identity.dateSoumission).toLocaleDateString("fr-FR")}`,
        14,
        88,
      );

      let yPos = 95;
      const lineHeight = 6;
      const sectionGap = 3;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 14;
      const maxWidth = 182; // 210 - (2 * 14)

      const addNewPageIfNeeded = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - 15) {
          doc.addPage();
          yPos = 20;
        }
      };

      const addSection = (title: string, content: string[]) => {
        addNewPageIfNeeded((content.length + 1) * lineHeight + 2 * sectionGap);

        doc.setFontSize(10);
        doc.setTextColor(...PRIMARY);
        doc.setFont("Helvetica", "bold");
        doc.text(title, margin, yPos);
        yPos += lineHeight + sectionGap;

        doc.setFont("Helvetica", "normal");
        doc.setTextColor(...TEXT_DARK);
        doc.setFontSize(9);

        content.forEach((line) => {
          const split = doc.splitTextToSize(line, maxWidth);
          split.forEach((txt: string) => {
            addNewPageIfNeeded(lineHeight);
            doc.text(txt, margin, yPos);
            yPos += lineHeight;
          });
        });

        yPos += sectionGap;
      };

      // Informations Personnelles
      addSection("I. INFORMATIONS PERSONNELLES", [
        `Nom : ${identity.nom}`,
        `Postnom : ${identity.postnom}`,
        `Prénom : ${identity.prenom}`,
        `Date de Naissance : ${new Date(identity.naissance).toLocaleDateString("fr-FR")}`,
        `Sexe : ${identity.sexe}`,
        `État Civil : ${identity.etatCivil}`,
        `Type de Pièce : ${identity.pieceType}`,
        `Numéro de Pièce : ${identity.pieceNumero}`,
        `Adresse : ${identity.adresse}`,
        `Paroisse d'origine : ${identity.paroisse}`,
      ]);

      // Informations de Contact
      addSection("I.1. INFORMATIONS DE CONTACT", [
        `Téléphone : ${identity.tel}`,
        `Email : ${identity.email}`,
      ]);

      // Contact d'Urgence
      addSection("II. CONTACT D'URGENCE", [
        `Nom : ${identity.urgenceNom}`,
        `Lien : ${identity.urgenceLien}`,
        `Téléphone Principal (WhatsApp) : ${identity.urgenceTelPrincipal}`,
        ...(identity.urgenceTelSecondaire
          ? [`Téléphone Secondaire (Mobile) : ${identity.urgenceTelSecondaire}`]
          : []),
        `Email : ${identity.urgenceEmail}`,
      ]);

      // Informations Médicales
      const medicalInfo: string[] = [];
      medicalInfo.push(`Allergies : ${identity.allergiesHas ? "Oui" : "Non"}`);
      if (identity.allergiesHas && identity.allergiesDetails) {
        medicalInfo.push(`  - ${identity.allergiesDetails}`);
      }
      medicalInfo.push(
        `Traitement Médical : ${identity.traitementHas ? "Oui" : "Non"}`,
      );
      if (identity.traitementHas && identity.traitementDetails) {
        medicalInfo.push(`  - ${identity.traitementDetails}`);
      }
      medicalInfo.push(
        `Maladie Chronique : ${identity.maladieHas ? "Oui" : "Non"}`,
      );
      if (identity.maladieHas && identity.maladieDetails) {
        medicalInfo.push(`  - ${identity.maladieDetails}`);
      }
      medicalInfo.push(
        `Régime Spécial : ${identity.regimeHas ? "Oui" : "Non"}`,
      );
      if (identity.regimeHas && identity.regimeDetails) {
        medicalInfo.push(`  - ${identity.regimeDetails}`);
      }
      if (identity.autres) {
        medicalInfo.push(`Autres : ${identity.autres}`);
      }

      addSection("III. INFORMATIONS MÉDICALES", medicalInfo);

      // Métadonnées
      addSection("MÉTADONNÉES", [
        `Statut : ${identity.approuve ? "Approuvée" : identity.lu ? "En Cours" : "Nouvelle"}`,
        `Lecture : ${identity.lu ? "Lue" : "Non lue"}`,
        `Approbation : ${identity.approuve ? "Approuvée" : "En attente"}`,
      ]);

      // Footer sur chaque page
      const pageCount = doc.getNumberOfPages();
      const today = new Date().toLocaleDateString("fr-FR");

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(...MUTED);

        doc.text(`Généré par burningheartihs.org • ${today}`, 14, 290);
        doc.text(`Page ${i} / ${pageCount}`, 190, 290, { align: "right" });
      }

      doc.save(
        `BHS-Identite-${identity.idFicheIdentite}-${identity.prenom}-${identity.nom}.pdf`,
      );

      toast({
        title: "Succès",
        description: "PDF téléchargé avec succès",
      });
    } catch (error: any) {
      console.error("Erreur génération PDF:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le PDF",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const confirmDelete = async () => {
    if (!identity) return;

    try {
      setIsDeleting(true);
      await deleteIdentity(identity.idFicheIdentite);

      toast({
        title: "Succès",
        description: "Fiche d'identité supprimée avec succès",
      });

      router.push("/admin/identities");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la fiche",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Fiche d'identité non trouvée</h2>
        <p className="text-muted-foreground mt-2">
          La fiche demandée n'existe pas ou a été supprimée.
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/identities">Retour à la liste</Link>
        </Button>
      </div>
    );
  }

  const nomComplet = `${identity.nom} ${identity.postnom} ${identity.prenom}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/admin/identities">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold sm:text-3xl">
              {nomComplet}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              ID: #{identity.idFicheIdentite}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap justify-end">
          {!identity.lu && <Badge variant="secondary">Nouvelle</Badge>}
          {identity.lu && !identity.approuve && (
            <Badge variant="outline">En cours</Badge>
          )}
          {identity.approuve && <Badge variant="default">Approuvée</Badge>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Télécharger PDF
        </Button>

        {!identity.approuve && (
          <Button
            onClick={handleApprove}
            disabled={isApproving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isApproving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Approuver
          </Button>
        )}

        <Button
          onClick={() => setDeleteDialogOpen(true)}
          disabled={isDeleting}
          variant="destructive"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Supprimer
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations Personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Informations Personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nom Complet</p>
              <p className="font-medium">{nomComplet}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type de Pièce</p>
              <p className="font-medium">{identity.pieceType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Numéro de Pièce</p>
              <p className="font-medium">{identity.pieceNumero}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date de Naissance</p>
              <p className="font-medium">
                {new Date(identity.naissance).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sexe</p>
              <p className="font-medium">{identity.sexe}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">État Civil</p>
              <p className="font-medium">{identity.etatCivil}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Adresse</p>
              <p className="font-medium">{identity.adresse}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paroisse</p>
              <p className="font-medium">{identity.paroisse}</p>
            </div>
          </CardContent>
        </Card>

        {/* Informations de Contact */}
        <Card>
          <CardHeader>
            <CardTitle>📞 Informations de Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Téléphone</p>
              <a
                href={`tel:${identity.tel}`}
                className="font-medium text-primary hover:underline"
              >
                {identity.tel}
              </a>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <a
                href={`mailto:${identity.email}`}
                className="font-medium text-primary hover:underline"
              >
                {identity.email}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact d'Urgence */}
      <Card>
        <CardHeader>
          <CardTitle>🆘 Contact d'Urgence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Nom</p>
              <p className="font-medium">{identity.urgenceNom}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Lien avec le Demandeur
              </p>
              <p className="font-medium">{identity.urgenceLien}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Téléphone Principal
              </p>
              <a
                href={`tel:${identity.urgenceTelPrincipal}`}
                className="font-medium text-primary hover:underline"
              >
                {identity.urgenceTelPrincipal}
              </a>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Téléphone Secondaire
              </p>
              <p className="font-medium">
                {identity.urgenceTelSecondaire || "N/A"}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Email</p>
              <a
                href={`mailto:${identity.urgenceEmail}`}
                className="font-medium text-primary hover:underline"
              >
                {identity.urgenceEmail}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations Médicales */}
      <Card>
        <CardHeader>
          <CardTitle>⚕️ Informations Médicales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Allergies */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm text-muted-foreground font-medium">
                Allergies
              </p>
              <Badge variant={identity.allergiesHas ? "default" : "outline"}>
                {identity.allergiesHas ? "Oui" : "Non"}
              </Badge>
            </div>
            {identity.allergiesHas && identity.allergiesDetails && (
              <p className="text-sm bg-muted p-3 rounded">
                {identity.allergiesDetails}
              </p>
            )}
          </div>

          {/* Traitement */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm text-muted-foreground font-medium">
                Traitement
              </p>
              <Badge variant={identity.traitementHas ? "default" : "outline"}>
                {identity.traitementHas ? "Oui" : "Non"}
              </Badge>
            </div>
            {identity.traitementHas && identity.traitementDetails && (
              <p className="text-sm bg-muted p-3 rounded">
                {identity.traitementDetails}
              </p>
            )}
          </div>

          {/* Maladie */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm text-muted-foreground font-medium">
                Maladie
              </p>
              <Badge variant={identity.maladieHas ? "default" : "outline"}>
                {identity.maladieHas ? "Oui" : "Non"}
              </Badge>
            </div>
            {identity.maladieHas && identity.maladieDetails && (
              <p className="text-sm bg-muted p-3 rounded">
                {identity.maladieDetails}
              </p>
            )}
          </div>

          {/* Régime Alimentaire */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm text-muted-foreground font-medium">
                Régime Alimentaire
              </p>
              <Badge variant={identity.regimeHas ? "default" : "outline"}>
                {identity.regimeHas ? "Oui" : "Non"}
              </Badge>
            </div>
            {identity.regimeHas && identity.regimeDetails && (
              <p className="text-sm bg-muted p-3 rounded">
                {identity.regimeDetails}
              </p>
            )}
          </div>

          {/* Autres */}
          {identity.autres && (
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-2">
                Autres Informations
              </p>
              <p className="text-sm bg-muted p-3 rounded">{identity.autres}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métadonnées */}
      <Card>
        <CardHeader>
          <CardTitle>ℹ️ Métadonnées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Date de Soumission</p>
            <p className="font-medium">
              {new Date(identity.dateSoumission).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Statut Lecture</p>
            <Badge variant={identity.lu ? "default" : "secondary"}>
              {identity.lu ? "Lue" : "Non lue"}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Statut Approbation</p>
            <Badge variant={identity.approuve ? "default" : "outline"}>
              {identity.approuve ? "Approuvée" : "En attente"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la fiche d'identité</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la fiche d'identité de{" "}
              <strong>{nomComplet}</strong> ? Cette action ne peut pas être
              annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
