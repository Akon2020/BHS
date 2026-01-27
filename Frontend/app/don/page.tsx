import Link from "next/link"
import { ArrowLeft, Heart, CreditCard, Building2, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function DonationPage() {
  return (
    <div className="min-h-screen py-16">
      <Header />
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-tight mb-4">Faire un Don</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Votre générosité nous aide à poursuivre notre mission spirituelle et à accompagner plus de personnes dans
            leur cheminement avec le Christ.
          </p>
        </div>

        <div className="grid gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Don par Carte Bancaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Effectuez votre don en ligne de manière sécurisée via carte bancaire.
              </p>
              <Button className="w-full sm:w-auto">Donner maintenant</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Virement Bancaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Coordonnées bancaires pour virement:</p>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nom:</span>
                  <span className="font-medium">Burning Heart</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Banque:</span>
                  <span className="font-medium">À définir</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compte:</span>
                  <span className="font-medium">À définir</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Mobile Money
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Numéro Mobile Money:</p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium text-center">+243 849 005 240</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <p className="text-sm leading-relaxed">
              Merci pour votre soutien! Chaque contribution, quelle que soit sa taille, fait une différence dans la vie
              de notre communauté.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
