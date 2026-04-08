"use client";

import { useEffect, useState } from "react";
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
import { Search, Eye, Trash, CheckCircle2, Clock } from "lucide-react";
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

import { getAllIdentity, deleteIdentity } from "@/actions/identity";
import type { FicheIdentite } from "@/types/user";

export default function IdentityAdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [identitiesList, setIdentitiesList] = useState<FicheIdentite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIdentity, setSelectedIdentity] = useState<FicheIdentite | null>(
    null,
  );

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Fiches d'Identité</h1>
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
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 relative">
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
                <TableRow key={identity.idFicheIdentite} className="hover:bg-muted/50">
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
                        <Link href={`/admin/identity/view/${identity.idFicheIdentite}`}>
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
    </div>
  );
}
