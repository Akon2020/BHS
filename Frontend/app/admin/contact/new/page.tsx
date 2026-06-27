"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { envoyerMessage } from "@/actions/message";

export default function NewMessagePage() {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [form, setForm] = useState({
    destinataireNom: "",
    destinataireEmail: "",
    sujet: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.destinataireEmail || !form.sujet || !form.message) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Le destinataire, le sujet et le message sont requis.",
      });
      return;
    }

    try {
      setIsSending(true);
      await envoyerMessage({
        destinataireEmail: form.destinataireEmail.trim(),
        destinataireNom: form.destinataireNom.trim() || undefined,
        sujet: form.sujet.trim(),
        message: form.message,
      });

      toast({
        title: "Message envoyé",
        description: `Votre message a été envoyé à ${form.destinataireEmail}.`,
      });
      router.push("/admin/contact/sent");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error?.message || "Impossible d'envoyer le message.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/contact">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Écrire un nouveau message
          </h1>
          <p className="text-sm text-muted-foreground">
            Composez et envoyez un message par email.
          </p>
        </div>
      </div>

      <Card className="mx-auto w-full max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="destinataireNom">Nom du destinataire</Label>
                <Input
                  id="destinataireNom"
                  placeholder="Nom (optionnel)"
                  value={form.destinataireNom}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinataireEmail">
                  Email du destinataire{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="destinataireEmail"
                  type="email"
                  placeholder="destinataire@email.com"
                  required
                  value={form.destinataireEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sujet">
                Sujet <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sujet"
                placeholder="Sujet du message"
                required
                value={form.sujet}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Écrivez votre message ici..."
                rows={10}
                required
                value={form.message}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/admin/contact">Annuler</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSending}
                className="w-full sm:w-auto"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer le message
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
