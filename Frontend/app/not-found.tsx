"use client"

import Link from "next/link"
import { Home, Search, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <div className="max-w-4xl w-full text-center">
        {/* Large 404 Text */}
        <div className="relative mb-8">
          <h1 className="text-[clamp(8rem,20vw,16rem)] font-bold text-primary/10 leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="w-24 h-24 md:w-32 md:h-32 text-primary animate-pulse" fill="currentColor" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">Page Introuvable</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Comme des pèlerins qui cherchent leur chemin, nous sommes là pour vous guider. Cette page semble s&apos;être
            égarée, mais ensemble nous trouverons le bon chemin.
          </p>
          <p className="text-base text-muted-foreground italic">
            &ldquo;Je suis le chemin, la vérité, et la vie.&rdquo; - Jean 14:6
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

          <Button asChild variant="outline" size="lg" className="min-w-[200px] group bg-transparent">
            <Link href="/blog">
              <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Explorer le Blog
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Liens Utiles</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/a-propos" className="text-primary hover:underline transition-colors">
              À Propos
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/services" className="text-primary hover:underline transition-colors">
              Services
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/evenements" className="text-primary hover:underline transition-colors">
              Événements
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/contact" className="text-primary hover:underline transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
