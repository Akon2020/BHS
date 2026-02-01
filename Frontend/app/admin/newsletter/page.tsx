"use client";

import { useEffect, useState } from "react";
import {
  getAllNewsletters,
  deleteNewsletter,
  sendNewsletter,
} from "@/actions/newsletter";
import { Newsletter } from "@/types/user";

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
  Plus,
  Eye,
  Edit,
  Trash,
  Send,
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
import { toast } from "@/components/ui/use-toast";

interface UINewsletter {
  id: number;
  title: string;
  subject: string;
  date: string;
  status: "brouillon" | "programme" | "envoye";
  recipients: number;
  openRate: string;
  scheduledDate?: string;
}

export default function NewsletterAdminPage() {
  const [newsletters, setNewsletters] = useState<UINewsletter[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchNewsletters = async () => {
    try {
      setLoading(true);

      const data = await getAllNewsletters({
        statut: statusFilter !== "all" ? statusFilter : undefined,
      });

      const mapped: UINewsletter[] = data.data.map(
        (newsletter: Newsletter) => ({
          id: newsletter.idNewsletter,
          title: newsletter.titreInterne,
          subject: newsletter.objetMail,
          date: new Date(newsletter.createdAt).toLocaleDateString(),
          status: newsletter.statut,
          recipients: newsletter.envois?.length ?? 0,
          openRate: "-",
          scheduledDate: newsletter.dateProgrammee
            ? new Date(newsletter.dateProgrammee).toLocaleDateString()
            : undefined,
        })
      );

      setNewsletters(mapped);
      setTotal(data.total);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletters();
  }, [statusFilter]);

  // 🔒 PROTECTION : empêcher suppression si déjà envoyée
  const handleDelete = async (newsletter: UINewsletter) => {
    if (newsletter.status === "envoye") {
      toast({
        title: "Action interdite",
        description:
          "Une newsletter déjà envoyée ne peut pas être supprimée.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteNewsletter(newsletter.id);
      setNewsletters((prev) =>
        prev.filter((n) => n.id !== newsletter.id)
      );

      toast({
        title: "Newsletter supprimée",
        description: newsletter.title,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSend = async (newsletter: UINewsletter) => {
    try {
      await sendNewsletter(newsletter.id);
      toast({
        title: "Newsletter envoyée",
        description: newsletter.title,
      });
      fetchNewsletters();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredNewsletters = newsletters.filter((newsletter) => {
    const matchesSearch =
      newsletter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      newsletter.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || newsletter.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Newsletters</h1>
        <Button asChild>
          <Link href="/admin/newsletter/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle newsletter
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher une newsletter..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="envoye">Envoyé</SelectItem>
            <SelectItem value="brouillon">Brouillon</SelectItem>
            <SelectItem value="programme">Programmé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Newsletter</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Destinataires</TableHead>
              <TableHead>Taux d'ouverture</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : (
              filteredNewsletters.map((newsletter) => (
                <TableRow key={newsletter.id}>
                  <TableCell>
                    <p className="font-medium">{newsletter.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {newsletter.subject}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {newsletter.status === "programme"
                        ? `Programmé pour : ${newsletter.scheduledDate}`
                        : `Créé le : ${newsletter.date}`}
                    </p>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        newsletter.status === "envoye"
                          ? "default"
                          : newsletter.status === "programme"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {newsletter.status === "envoye"
                        ? "Envoyé"
                        : newsletter.status === "programme"
                        ? "Programmé"
                        : "Brouillon"}
                    </Badge>
                  </TableCell>

                  <TableCell>{newsletter.recipients}</TableCell>
                  <TableCell>{newsletter.openRate}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link
                          href={`/admin/newsletter/view/${newsletter.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>

                      {newsletter.status === "brouillon" && (
                        <>
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              href={`/admin/newsletter/${newsletter.id}/edit`}
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSend(newsletter)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {/* 🔒 Bouton suppression désactivé si envoyée */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`text-red-500 hover:text-red-600 ${
                          newsletter.status === "envoye"
                            ? "opacity-40 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={newsletter.status === "envoye"}
                        onClick={() => handleDelete(newsletter)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredNewsletters.length} sur {total} newsletters
      </p>
    </div>
  );
}
