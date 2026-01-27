"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Save, Send, Calendar } from "lucide-react"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import BlogEditor from "@/components/admin/blog-editor"

export default function NewNewsletterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [newsletterData, setNewsletterData] = useState({
    title: "",
    subject: "",
    content: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewsletterData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditorChange = (content: string) => {
    setNewsletterData((prev) => ({ ...prev, content }))
  }

  const handleSubmit = async (action: "draft" | "send" | "schedule") => {
    if (!newsletterData.title || !newsletterData.subject || !newsletterData.content) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    if (action === "schedule" && !date) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date pour programmer l'envoi.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      let message = ""

      switch (action) {
        case "draft":
          message = "Votre brouillon a été enregistré avec succès."
          break
        case "send":
          message = "Votre newsletter a été envoyée avec succès."
          break
        case "schedule":
          message = `Votre newsletter a été programmée pour le ${format(date!, "PPP", { locale: fr })}.`
          break
      }

      toast({
        title:
          action === "draft"
            ? "Brouillon enregistré!"
            : action === "send"
              ? "Newsletter envoyée!"
              : "Newsletter programmée!",
        description: message,
      })
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/newsletter">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Nouvelle Newsletter</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit("draft")} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" disabled={isLoading}>
                <Calendar className="h-4 w-4 mr-2" />
                {date ? format(date, "PPP", { locale: fr }) : "Programmer"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
              <div className="p-3 border-t">
                <Button className="w-full" onClick={() => handleSubmit("schedule")} disabled={!date || isLoading}>
                  Programmer l'envoi
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={() => handleSubmit("send")} disabled={isLoading}>
            <Send className="h-4 w-4 mr-2" />
            Envoyer maintenant
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Titre interne <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Titre pour identifier cette newsletter (non visible par les destinataires)"
                    value={newsletterData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">
                    Objet de l'email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="Objet de l'email qui sera envoyé"
                    value={newsletterData.subject}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="editor">
                <TabsList className="mb-4">
                  <TabsTrigger value="editor">Éditeur</TabsTrigger>
                  <TabsTrigger value="preview">Aperçu</TabsTrigger>
                </TabsList>
                <TabsContent value="editor">
                  <BlogEditor onChange={handleEditorChange} />
                </TabsContent>
                <TabsContent value="preview">
                  <div className="prose prose-lg max-w-none dark:prose-invert min-h-[300px] border rounded-md p-4">
                    {newsletterData.content ? (
                      <div dangerouslySetInnerHTML={{ __html: newsletterData.content }} />
                    ) : (
                      <p className="text-muted-foreground">L'aperçu apparaîtra ici...</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Destinataires</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Tous les abonnés</span>
                  <span className="font-medium">573</span>
                </div>

                <Button variant="outline" className="w-full">
                  Gérer les listes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Test</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Email de test</Label>
                  <div className="flex gap-2">
                    <Input id="test-email" placeholder="votre@email.com" />
                    <Button variant="outline">Envoyer</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Envoyez-vous un email de test pour vérifier l'apparence de votre newsletter.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
