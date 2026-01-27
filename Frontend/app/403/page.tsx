"use client"

import Link from "next/link"
import { Home, Lock, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 px-4">
      <div className="max-w-4xl w-full text-center">
        {/* Large 403 Text */}
        <div className="relative mb-8">
          <h1 className="text-[clamp(8rem,20vw,16rem)] font-bold text-destructive/10 leading-none select-none">
            403
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-24 h-24 md:w-32 md:h-32 text-destructive animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Accès Refusé
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Cette zone est protégée. Vous n’avez pas l’autorisation nécessaire pour accéder à cette page.
            Si vous pensez qu’il s’agit d’une erreur, revenez à l’accueil ou contactez l’administrateur.
          </p>

          <p className="text-base text-muted-foreground italic">
            &ldquo;Il y a un temps pour toute chose.&rdquo; – Ecclésiaste 3:1
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="min-w-[200px] group">
            <Link href="/">
              <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Retour à l&apos;Accueil
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-w-[200px] group bg-transparent"
          >
            <Link href="/contact">
              <ShieldAlert className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Contacter l&apos;Admin
            </Link>
          </Button>
        </div>

        {/* Security Hint */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Accès sécurisé
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Cette ressource nécessite des permissions spécifiques</span>
          </div>
        </div>
      </div>
    </div>
  )
}
