"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { createNewsletter, sendNewsletter } from "@/actions/newsletter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

import { ArrowLeft, Save, Send, Calendar, Loader2 } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

import { format } from "date-fns";
import { fr } from "date-fns/locale";

import BlogEditor from "@/components/admin/blog-editor";

export default function NewNewsletterPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const [newsletterData, setNewsletterData] = useState({
    title: "",
    subject: "",
    content: "",
  });

  // =========================
  // Handlers (SAFE / STABLE)
  // =========================

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setNewsletterData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleEditorChange = useCallback((content: string) => {
    setNewsletterData((prev) => ({ ...prev, content }));
  }, []);

  const validateForm = useCallback(() => {
    const errors: string[] = [];

    if (!newsletterData.title.trim()) {
      errors.push("Le titre interne est obligatoire");
    }
    if (!newsletterData.subject.trim()) {
      errors.push("L’objet de l’email est obligatoire");
    }
    if (!newsletterData.content.trim()) {
      errors.push("Le contenu est obligatoire");
    }

    return errors;
  }, [newsletterData]);

  const handleSubmit = useCallback(
    async (action: "draft" | "send" | "schedule") => {
      const errors = validateForm();

      if (errors.length > 0) {
        toast({
          title: "Erreur de validation",
          description: errors.join(". "),
          variant: "destructive",
        });
        return;
      }

      if (action === "schedule" && !date) {
        toast({
          title: "Erreur",
          description:
            "Veuillez sélectionner une date pour programmer l’envoi.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      setIsSubmitting(true);

      try {
        // 1️⃣ Création newsletter
        const result = await createNewsletter({
          titreInterne: newsletterData.title.trim(),
          objetMail: newsletterData.subject.trim(),
          contenu: newsletterData.content,
          statut: action === "schedule" ? "programme" : "brouillon",
          dateProgrammee:
            action === "schedule" && date
              ? date.toISOString()
              : undefined,
        });

        // 2️⃣ Envoi immédiat
        if (action === "send") {
          await sendNewsletter(result.data.idNewsletter);
        }

        toast({
          title:
            action === "draft"
              ? "Brouillon enregistré"
              : action === "send"
              ? "Newsletter envoyée"
              : "Newsletter programmée",
          description:
            action === "schedule"
              ? `Envoi prévu pour le ${format(date!, "PPP", {
                  locale: fr,
                })}`
              : "Opération réalisée avec succès",
        });

        // 3️⃣ Redirection (même pattern que blog)
        setTimeout(() => {
          router.push("/admin/newsletter");
          router.refresh();
        }, 1200);
      } catch (error: any) {
        toast({
          title: "Erreur",
          description:
            error.message ||
            "Une erreur est survenue lors de l’enregistrement",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsSubmitting(false);
      }
    },
    [newsletterData, date, validateForm, router],
  );

  // =========================
  // RENDER
  // =========================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href="/admin/newsletter">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Nouvelle Newsletter
            </h1>
            <p className="text-sm text-muted-foreground">
              Créez et envoyez une nouvelle newsletter
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit("draft")}
            disabled={isLoading || isSubmitting}
            className="min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer comme brouillon"
            )}
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={isLoading || isSubmitting}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {date
                  ? format(date, "PPP", { locale: fr })
                  : "Programmer"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
              <div className="p-3 border-t">
                <Button
                  className="w-full"
                  onClick={() => handleSubmit("schedule")}
                  disabled={!date || isLoading || isSubmitting}
                >
                  Programmer l’envoi
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            onClick={() => handleSubmit("send")}
            disabled={isLoading || isSubmitting}
          >
            <Send className="h-4 w-4 mr-2" />
            Envoyer maintenant
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>
                  Titre interne <span className="text-destructive">*</span>
                </Label>
                <Input
                  name="title"
                  value={newsletterData.title}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Objet de l’email{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  name="subject"
                  value={newsletterData.subject}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="editor">
                <TabsList className="mb-4">
                  <TabsTrigger value="editor">
                    Éditeur
                  </TabsTrigger>
                  <TabsTrigger value="preview">
                    Aperçu
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="editor">
                  <BlogEditor
                    initialContent={newsletterData.content}
                    onChange={handleEditorChange}
                    disabled={isLoading}
                  />
                </TabsContent>

                <TabsContent value="preview">
                  <div className="prose prose-lg max-w-none dark:prose-invert min-h-[300px] border rounded-md p-4">
                    {newsletterData.content ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: newsletterData.content,
                        }}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        L’aperçu apparaîtra ici…
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
