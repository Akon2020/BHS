"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getContactById,
  getContactsByEmail,
  replyToContact,
} from "@/actions/contact";
import type { Contact } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  CalendarClock,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";

interface ContactReply {
  idReponseContact: number;
  idContact: number;
  sujetReponse: string;
  messageReponse: string;
  emailDestinataire: string;
  sentAt: string;
}

type ContactWithReplies = Contact & {
  reponses?: ContactReply[];
};

interface ConversationItem {
  id: string;
  sender: "user" | "admin";
  contactId: number;
  subject: string;
  message: string;
  createdAt: string;
}

export default function ContactViewAdminPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [contact, setContact] = useState<ContactWithReplies | null>(null);
  const [sameEmailContacts, setSameEmailContacts] = useState<
    ContactWithReplies[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);

  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");

  const fetchCurrentContact = async (contactId: number) => {
    const data = await getContactById(contactId);
    setContact(data);
    setReplySubject((prev) => prev || `Re: ${data.sujet}`);
    return data;
  };

  const fetchSameEmailContacts = async (email: string) => {
    const response = await getContactsByEmail(email);
    const list = [...(response.contactsInfo || [])].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    setSameEmailContacts(list);
  };

  useEffect(() => {
    if (Number.isNaN(id)) {
      router.push("/admin/contact");
      return;
    }

    const init = async () => {
      try {
        setLoading(true);
        const current = await fetchCurrentContact(id);
        await fetchSameEmailContacts(current.email);
      } catch (error: any) {
        toast({
          title: "Erreur",
          description:
            error.message || "Impossible de charger cette correspondance.",
          variant: "destructive",
        });
        router.push("/admin/contact");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, router]);

  const conversationItems = useMemo(() => {
    const items: ConversationItem[] = [];

    sameEmailContacts.forEach((entry) => {
      items.push({
        id: `user-${entry.idContact}`,
        sender: "user",
        contactId: entry.idContact,
        subject: entry.sujet,
        message: entry.message,
        createdAt: entry.createdAt,
      });

      const replies = [...(entry.reponses || [])].sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
      );

      replies.forEach((reply) => {
        items.push({
          id: `admin-${entry.idContact}-${reply.idReponseContact}`,
          sender: "admin",
          contactId: entry.idContact,
          subject: reply.sujetReponse,
          message: reply.messageReponse,
          createdAt: reply.sentAt,
        });
      });
    });

    return items.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [sameEmailContacts]);

  const totalReplies = useMemo(
    () =>
      sameEmailContacts.reduce(
        (count, entry) => count + (entry.reponses?.length || 0),
        0,
      ),
    [sameEmailContacts],
  );

  const handleSendReply = async () => {
    if (!contact) return;

    const sujetReponse = replySubject.trim();
    const messageReponse = replyMessage.trim();

    if (!sujetReponse || !messageReponse) {
      toast({
        title: "Champs requis",
        description: "Veuillez renseigner le sujet et le message de réponse.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSendingReply(true);

      await replyToContact(contact.idContact, {
        sujetReponse,
        messageReponse,
      });

      const refreshed = await fetchCurrentContact(contact.idContact);
      await fetchSameEmailContacts(refreshed.email);

      setReplyMessage("");

      toast({
        title: "Réponse envoyée",
        description: `Votre message a été transmis à ${contact.nomComplet}.`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer la réponse.",
        variant: "destructive",
      });
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!contact) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/contact")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Conversation de contact</h1>
            <p className="text-sm text-muted-foreground">
              Vue détaillée des échanges avec {contact.nomComplet}
            </p>
          </div>
        </div>

        <Badge variant={contact.repondu ? "default" : "secondary"}>
          {contact.repondu ? "Répondu" : "En attente"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Fil des correspondances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[470px] pr-4">
              {conversationItems.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  Aucun échange disponible.
                </div>
              ) : (
                <div className="space-y-3">
                  {conversationItems.map((item) => (
                    <div
                      key={item.id}
                      className={`max-w-[85%] rounded-xl border p-4 shadow-sm ${
                        item.sender === "user"
                          ? "bg-sky-50 border-sky-200 dark:bg-sky-950/25 dark:border-sky-900 self-start"
                          : "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/25 dark:border-emerald-900 self-end ml-auto"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          {item.sender === "user" ? (
                            <>
                              <UserRound className="h-4 w-4" />
                              {contact.nomComplet}
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4" />
                              Administration
                            </>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString("fr-FR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{item.subject}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Détails du contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Nom complet</p>
              <p className="font-medium">{contact.nomComplet}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> Email
              </p>
              <p className="break-all font-medium">{contact.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sujet actuel</p>
              <p className="font-medium">{contact.sujet}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" /> Dernier message
              </p>
              <p className="font-medium">
                {new Date(contact.createdAt).toLocaleString("fr-FR")}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-muted-foreground">Total correspondances</p>
              <p className="text-2xl font-bold">{sameEmailContacts.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total réponses envoyées</p>
              <Badge variant="outline" className="mt-1">
                {totalReplies}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repondre a la correspondance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Sujet de la reponse"
            value={replySubject}
            onChange={(e) => setReplySubject(e.target.value)}
          />
          <Textarea
            placeholder="Ecrivez votre reponse a l'utilisateur..."
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            rows={6}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSendReply}
              disabled={sendingReply}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {sendingReply ? "Envoi en cours..." : "Envoyer la reponse"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
