"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAllContacts } from "@/actions/contact";
import type { Contact, ContactStatut } from "@/types/user";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Eye, Loader2, Mail, Search } from "lucide-react";

interface UIContact {
  id: number;
  nomComplet: string;
  email: string;
  sujet: string;
  message: string;
  statut: ContactStatut;
  repondu: boolean;
  createdAt: string;
}

const statusLabel: Record<ContactStatut, string> = {
  nouveau: "Nouveau",
  lu: "Lu",
  traite: "Traite",
  archive: "Archive",
};

export default function ContactAdminPage() {
  const [contacts, setContacts] = useState<UIContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await getAllContacts();
      const mapped: UIContact[] = (res.contactsInfo || []).map((contact: Contact) => ({
        id: contact.idContact,
        nomComplet: contact.nomComplet,
        email: contact.email,
        sujet: contact.sujet,
        message: contact.message,
        statut: contact.statut,
        repondu: contact.repondu,
        createdAt: contact.createdAt,
      }));

      setContacts(mapped);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les correspondances.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return contacts.filter((contact) => {
      const matchesSearch =
        !q ||
        contact.nomComplet.toLowerCase().includes(q) ||
        contact.email.toLowerCase().includes(q) ||
        contact.sujet.toLowerCase().includes(q) ||
        contact.message.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || contact.statut === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contacts, searchQuery, statusFilter]);

  const getStatusBadgeClass = (statut: ContactStatut) => {
    if (statut === "nouveau") return "bg-blue-100 text-blue-800 border-blue-200";
    if (statut === "lu") return "bg-amber-100 text-amber-800 border-amber-200";
    if (statut === "traite") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Contacts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivez les messages entrants et gerez les reponses administratives.
          </p>
        </div>
        <Button variant="outline" onClick={fetchContacts}>
          Recharger
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par nom, email, sujet ou message..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="nouveau">Nouveau</SelectItem>
            <SelectItem value="lu">Lu</SelectItem>
            <SelectItem value="traite">Traite</SelectItem>
            <SelectItem value="archive">Archive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[28%]">Expediteur</TableHead>
              <TableHead className="w-[30%]">Correspondance</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Reponse</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                </TableCell>
              </TableRow>
            ) : filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Aucun message trouve.
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <p className="font-medium">{contact.nomComplet}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {contact.email}
                    </p>
                  </TableCell>

                  <TableCell>
                    <p className="line-clamp-1 font-medium">{contact.sujet}</p>
                    {/* <p className="line-clamp-2 text-sm text-muted-foreground">{contact.message}</p> */}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeClass(contact.statut)}>
                      {statusLabel[contact.statut]}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant={contact.repondu ? "default" : "secondary"}>
                      {contact.repondu ? "Repondu" : "En attente"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {new Date(contact.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>

                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/contact/view/${contact.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredContacts.length} sur {contacts.length} correspondances
      </p>
    </div>
  );
}
