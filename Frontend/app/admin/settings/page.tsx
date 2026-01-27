"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Save, Upload, Mail, Facebook, Instagram, Youtube, Twitter } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Burning Heart",
    tagline: "Ignatian Spirituality",
    email: "contact@burningheart.org",
    phone: "+33 1 23 45 67 89",
    address: "123 Avenue Maison, 243 Bukavu, République Democratique du Congo",
    logo: null,
    favicon: null,
  })

  const [socialSettings, setSocialSettings] = useState({
    facebook: "https://facebook.com/burningheart",
    instagram: "https://instagram.com/burningheart",
    youtube: "https://youtube.com/burningheart",
    twitter: "https://twitter.com/burningheart",
  })

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUser: "user@example.com",
    smtpPassword: "••••••••",
    fromEmail: "noreply@burningheart.org",
    fromName: "Burning Heart",
    enableEmailNotifications: true,
  })

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setGeneralSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSocialSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmailSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleEmailSwitchChange = (checked: boolean) => {
    setEmailSettings((prev) => ({ ...prev, enableEmailNotifications: checked }))
  }

  const handleSaveSettings = async (type: "general" | "social" | "email") => {
    setIsLoading(true)

    try {
      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Paramètres enregistrés",
        description: "Les paramètres ont été mis à jour avec succès.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement des paramètres.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Paramètres</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="social">Réseaux sociaux</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres généraux</CardTitle>
              <CardDescription>Configurez les informations de base de votre site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nom du site</Label>
                  <Input
                    id="siteName"
                    name="siteName"
                    value={generalSettings.siteName}
                    onChange={handleGeneralChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Slogan</Label>
                  <Input id="tagline" name="tagline" value={generalSettings.tagline} onChange={handleGeneralChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email de contact</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={generalSettings.email}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" name="phone" value={generalSettings.phone} onChange={handleGeneralChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={generalSettings.address}
                  onChange={handleGeneralChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="border-2 border-dashed rounded-md p-4 text-center">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir un fichier
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">PNG, JPG ou SVG. Max 1MB.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed rounded-md p-4 text-center">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir un fichier
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">ICO, PNG. 32x32px recommandé.</p>
                  </div>
                </div>
              </div>

              <Button className="mt-4" onClick={() => handleSaveSettings("general")} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Settings */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Réseaux sociaux</CardTitle>
              <CardDescription>Configurez les liens vers vos profils de réseaux sociaux.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <div className="flex items-center">
                  <Facebook className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    id="facebook"
                    name="facebook"
                    value={socialSettings.facebook}
                    onChange={handleSocialChange}
                    placeholder="https://facebook.com/votrepage"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="flex items-center">
                  <Instagram className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    id="instagram"
                    name="instagram"
                    value={socialSettings.instagram}
                    onChange={handleSocialChange}
                    placeholder="https://instagram.com/votrecompte"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <div className="flex items-center">
                  <Youtube className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    id="youtube"
                    name="youtube"
                    value={socialSettings.youtube}
                    onChange={handleSocialChange}
                    placeholder="https://youtube.com/votrechaine"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <div className="flex items-center">
                  <Twitter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    id="twitter"
                    name="twitter"
                    value={socialSettings.twitter}
                    onChange={handleSocialChange}
                    placeholder="https://twitter.com/votrecompte"
                  />
                </div>
              </div>

              <Button className="mt-4" onClick={() => handleSaveSettings("social")} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres d'email</CardTitle>
              <CardDescription>Configurez les paramètres pour l'envoi d'emails.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">Serveur SMTP</Label>
                  <Input
                    id="smtpHost"
                    name="smtpHost"
                    value={emailSettings.smtpHost}
                    onChange={handleEmailChange}
                    placeholder="smtp.example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Port SMTP</Label>
                  <Input
                    id="smtpPort"
                    name="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={handleEmailChange}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">Utilisateur SMTP</Label>
                  <Input
                    id="smtpUser"
                    name="smtpUser"
                    value={emailSettings.smtpUser}
                    onChange={handleEmailChange}
                    placeholder="user@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">Mot de passe SMTP</Label>
                  <Input
                    id="smtpPassword"
                    name="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={handleEmailChange}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">Email d'expédition</Label>
                  <Input
                    id="fromEmail"
                    name="fromEmail"
                    value={emailSettings.fromEmail}
                    onChange={handleEmailChange}
                    placeholder="noreply@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromName">Nom d'expédition</Label>
                  <Input
                    id="fromName"
                    name="fromName"
                    value={emailSettings.fromName}
                    onChange={handleEmailChange}
                    placeholder="Votre Nom"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableEmailNotifications">Activer les notifications par email</Label>
                <Switch
                  id="enableEmailNotifications"
                  checked={emailSettings.enableEmailNotifications}
                  onCheckedChange={handleEmailSwitchChange}
                />
              </div>

              <Button className="mt-4" onClick={() => handleSaveSettings("email")} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>

              <div className="mt-4 p-4 bg-secondary rounded-md">
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Tester la configuration</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Envoyez un email de test pour vérifier que votre configuration fonctionne correctement.
                    </p>
                    <div className="flex gap-2">
                      <Input placeholder="email@example.com" className="max-w-xs" />
                      <Button variant="outline" size="sm">
                        Envoyer un test
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
