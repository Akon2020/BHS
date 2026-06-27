"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Eye,
  Trash,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
} from "lucide-react";
import Link from "next/link";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { getAllIdentity, deleteIdentity } from "@/actions/identity";
import type { FicheIdentite } from "@/types/user";

export default function IdentityAdminPage() {
  type ExportMode = "approved" | "new" | "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [identitiesList, setIdentitiesList] = useState<FicheIdentite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedIdentity, setSelectedIdentity] =
    useState<FicheIdentite | null>(null);

  const fetchIdentities = async () => {
    try {
      setIsLoading(true);
      const res = await getAllIdentity();
      setIdentitiesList(res.fichesIdentites || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les identités",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdentities();
  }, [statusFilter]);

  const filteredIdentities = identitiesList.filter((identity) => {
    const q = searchQuery.toLowerCase();

    const nomComplet =
      `${identity.nom} ${identity.postnom} ${identity.prenom}`.toLowerCase();
    const matchesSearch =
      nomComplet.includes(q) ||
      identity.email.toLowerCase().includes(q) ||
      identity.tel.toLowerCase().includes(q);

    if (statusFilter === "approuve") {
      return matchesSearch && identity.approuve;
    } else if (statusFilter === "encours") {
      return matchesSearch && !identity.approuve && identity.lu;
    } else if (statusFilter === "nouveau") {
      return matchesSearch && !identity.lu;
    }

    return matchesSearch;
  });

  const handleDeleteIdentity = (identity: FicheIdentite) => {
    setSelectedIdentity(identity);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteIdentity = async () => {
    if (!selectedIdentity) return;

    try {
      await deleteIdentity(selectedIdentity.idFicheIdentite);

      setIdentitiesList((prev) =>
        prev.filter(
          (identity) =>
            identity.idFicheIdentite !== selectedIdentity.idFicheIdentite,
        ),
      );

      toast({
        title: "Identité supprimée",
        description: `L'identité de ${selectedIdentity.nom} ${selectedIdentity.prenom} a été supprimée avec succès.`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'identité",
        variant: "destructive",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedIdentity(null);
    }
  };

  const stats = {
    total: identitiesList.length,
    approuves: identitiesList.filter((i) => i.approuve).length,
    encours: identitiesList.filter((i) => !i.approuve && i.lu).length,
    nouveaux: identitiesList.filter((i) => !i.lu).length,
  };

  const getStatusLabel = (identity: FicheIdentite) => {
    if (identity.approuve) return "Approuvée";
    if (!identity.lu) return "Nouvelle";
    return "En cours";
  };

  const getExportData = (mode: ExportMode) => {
    if (mode === "approved") {
      return identitiesList.filter((identity) => identity.approuve);
    }
    if (mode === "new") {
      return identitiesList.filter((identity) => !identity.lu);
    }
    return identitiesList;
  };

  const handleExportPDF = async (mode: ExportMode) => {
    try {
      const exportList = getExportData(mode);

      if (exportList.length === 0) {
        toast({
          title: "Aucune donnée",
          description: "Aucune fiche d'identité disponible pour cet export.",
          variant: "destructive",
        });
        return;
      }

      setIsExporting(true);

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
        `${window.location.origin}/admin/identities`,
        {
          margin: 1,
          width: 300,
          color: {
            dark: "#941C26",
            light: "#FFFFFF",
          },
        },
      );

      const exportTitle =
        mode === "approved"
          ? "Liste des identités approuvées"
          : mode === "new"
            ? "Liste des identités nouvelles"
            : "Liste complète des identités";

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
      doc.text(exportTitle, 14, 75);

      doc.setFontSize(10);
      doc.setTextColor(...MUTED);
      doc.text(`Nombre total : ${exportList.length}`, 14, 82);
      doc.text(`Généré le : ${new Date().toLocaleDateString("fr-FR")}`, 14, 88);

      const rows = exportList.map((identity, i) => [
        i + 1,
        `${identity.nom} ${identity.postnom} ${identity.prenom}`,
        identity.email,
        identity.tel,
        getStatusLabel(identity),
        new Date(identity.dateSoumission).toLocaleDateString("fr-FR"),
      ]);

      autoTable(doc, {
        head: [
          ["#", "Nom complet", "Email", "Téléphone", "Statut", "Soumis le"],
        ],
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

      const fileSuffix =
        mode === "approved"
          ? "approuvees"
          : mode === "new"
            ? "nouvelles"
            : "complet";

      doc.save(`BHS-Identites-${fileSuffix}.pdf`);

      setIsExportModalOpen(false);
      toast({
        title: "Export réussi",
        description: "Le fichier PDF a été généré avec succès.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erreur export PDF",
        description: "Impossible de générer le PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">Gestion des Fiches d'Identité</h1>
        <Button onClick={() => setIsExportModalOpen(true)}>
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Approuvées
          </p>
          <p className="text-3xl font-bold mt-2 text-green-600">
            {stats.approuves}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            En Cours
          </p>
          <p className="text-3xl font-bold mt-2 text-amber-600">
            {stats.encours}
          </p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Nouvelles</p>
          <p className="text-3xl font-bold mt-2">{stats.nouveaux}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="nouveau">Nouvelles (Non lues)</SelectItem>
            <SelectItem value="encours">En cours (Lues)</SelectItem>
            <SelectItem value="approuve">Approuvées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          </div>
        ) : filteredIdentities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aucune fiche d'identité trouvée
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nom Complet</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Date de Soumission</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIdentities.map((identity) => (
                <TableRow
                  key={identity.idFicheIdentite}
                  className="hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    {identity.nom} {identity.postnom} {identity.prenom}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${identity.email}`}
                      className="text-primary hover:underline"
                    >
                      {identity.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`tel:${identity.tel}`}
                      className="text-primary hover:underline"
                    >
                      {identity.tel}
                    </a>
                  </TableCell>
                  <TableCell>
                    {new Date(identity.dateSoumission).toLocaleDateString(
                      "fr-FR",
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      {!identity.lu && (
                        <Badge variant="secondary">Nouvelle</Badge>
                      )}
                      {identity.lu && !identity.approuve && (
                        <Badge variant="outline">En cours</Badge>
                      )}
                      {identity.approuve && (
                        <Badge variant="default">Approuvée</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="text-primary border-primary hover:bg-primary/10"
                      >
                        <Link
                          href={`/admin/identities/view/${identity.idFicheIdentite}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteIdentity(identity)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onConfirm={confirmDeleteIdentity}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer la fiche d'identité"
        description={`Êtes-vous sûr de vouloir supprimer la fiche d'identité de ${selectedIdentity?.nom} ${selectedIdentity?.prenom} ? Cette action ne peut pas être annulée.`}
      />

      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exporter les fiches d'identité</DialogTitle>
            <DialogDescription>
              Choisissez le type de liste à exporter au format PDF.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <Button
              onClick={() => handleExportPDF("approved")}
              disabled={isExporting}
              className="justify-start"
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Exporter les approuvés
            </Button>

            <Button
              onClick={() => handleExportPDF("new")}
              disabled={isExporting}
              variant="secondary"
              className="justify-start"
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Exporter les non approuvées (Nouvelles)
            </Button>

            <Button
              onClick={() => handleExportPDF("all")}
              disabled={isExporting}
              variant="outline"
              className="justify-start"
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Exporter toute la liste
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsExportModalOpen(false)}
              disabled={isExporting}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
