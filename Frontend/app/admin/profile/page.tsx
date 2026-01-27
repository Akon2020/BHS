import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"

export const metadata: Metadata = {
  title: "Profil Administrateur - Burning Heart",
  description: "Gérez votre profil administrateur",
}

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles et vos préférences.</p>
      </div>

      <Separator />

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-1/3">
          <CardHeader>
            <CardTitle>Votre profil</CardTitle>
            <CardDescription>Votre photo et informations de base</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src="/placeholder.svg?height=128&width=128" alt="Avatar" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-medium">Admin Burning Heart</h3>
              <p className="text-sm text-muted-foreground">admin@burningheart.fr</p>
              <p className="text-sm text-muted-foreground">Administrateur</p>
            </div>
            <Button variant="outline">Changer la photo</Button>
          </CardContent>
        </Card>

        <div className="flex-1">
          <Tabs defaultValue="account">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Compte</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                  <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input id="firstName" placeholder="Prénom" defaultValue="Admin" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input id="lastName" placeholder="Nom" defaultValue="Burning Heart" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Email" defaultValue="admin@burningheart.fr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <textarea
                      id="bio"
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Parlez un peu de vous..."
                      defaultValue="Administrateur du site Burning Heart."
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Enregistrer les modifications</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Changer le mot de passe</CardTitle>
                  <CardDescription>Mettez à jour votre mot de passe pour sécuriser votre compte</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Mettre à jour le mot de passe</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Authentification à deux facteurs</CardTitle>
                  <CardDescription>Ajoutez une couche de sécurité supplémentaire à votre compte</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Authentification par SMS</p>
                      <p className="text-sm text-muted-foreground">Recevez un code de vérification par SMS</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Application d'authentification</p>
                      <p className="text-sm text-muted-foreground">
                        Utilisez une application comme Google Authenticator
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Préférences de notification</CardTitle>
                  <CardDescription>Configurez comment vous souhaitez être notifié</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nouveaux utilisateurs</p>
                      <p className="text-sm text-muted-foreground">
                        Soyez notifié lorsqu'un nouvel utilisateur s'inscrit
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Nouveaux commentaires</p>
                      <p className="text-sm text-muted-foreground">
                        Soyez notifié lorsqu'un nouveau commentaire est publié
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mises à jour système</p>
                      <p className="text-sm text-muted-foreground">
                        Soyez notifié des mises à jour importantes du système
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifications par email</p>
                      <p className="text-sm text-muted-foreground">Recevez également les notifications par email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Enregistrer les préférences</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
