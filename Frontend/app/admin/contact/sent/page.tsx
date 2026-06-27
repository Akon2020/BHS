"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Loader2, PenSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DeleteConfirmationModal from "@/components/modals/delete-confirmation-modal";
import { toast } from "@/components/ui/use-toast";
import { getMessagesEnvoyes, deleteMessageEnvoye } from "@/actions/message";
import type { MessageEnvoye } from "@/types/user";

export default function SentMessagesPage() {
  const [messages, setMessages] = useState<MessageEnvoye[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<MessageEnvoye | null>(null);
  const [toDelete, setToDelete] = useState<MessageEnvoye | null>(null);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const res = await getMessagesEnvoyes();
      setMessages(res.messages || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error?.message || "Impossible de charger les messages envoyés.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMessageEnvoye(toDelete.idMessage);
      setMessages((prev) =>
        prev.filter((m) => m.idMessage !== toDelete.idMessage),
      );
      toast({ title: "Message supprimé" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Suppression impossible.",
      });
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/contact">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Messages envoyés</h1>
            <p className="text-sm text-muted-foreground">
              Historique des messages envoyés depuis l'administration.
            </p>
          </div>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/contact/new">
            <PenSquare className="mr-2 h-4 w-4" />
            Écrire un nouveau message
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Destinataire</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : messages.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  Aucun message envoyé pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              messages.map((msg) => (
                <TableRow key={msg.idMessage}>
                  <TableCell>
                    <div className="min-w-0">
                      {msg.destinataireNom && (
                        <p className="font-medium">{msg.destinataireNom}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {msg.destinataireEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {msg.sujet}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        msg.statut === "envoye" ? "default" : "destructive"
                      }
                    >
                      {msg.statut === "envoye" ? "Envoyé" : "Échec"}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(msg.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelected(msg)}
                        aria-label="Voir le message"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setToDelete(msg)}
                        aria-label="Supprimer le message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="break-words">{selected?.sujet}</DialogTitle>
            <DialogDescription>
              À {selected?.destinataireNom ? `${selected.destinataireNom} — ` : ""}
              {selected?.destinataireEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {selected?.message}
          </div>
          {selected?.statut === "echec" && selected?.erreur && (
            <p className="text-sm text-destructive">
              Échec de l'envoi : {selected.erreur}
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <DeleteConfirmationModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer ce message ?"
        description="Cette action est irréversible. Le message sera retiré de l'historique."
      />
    </div>
  );
}
