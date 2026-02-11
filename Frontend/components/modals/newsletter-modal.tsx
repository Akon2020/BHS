"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Mail, CheckCircle } from "lucide-react"
import { addAbonne } from "@/actions/abonne"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface NewsletterModalProps {
  isOpen: boolean
  onClose: () => void
  initialEmail?: string
  onSuccess?: () => void
}

export function NewsletterModal({
  isOpen,
  onClose,
  initialEmail = "",
  onSuccess,
}: NewsletterModalProps) {
  const [formData, setFormData] = useState({
    nomComplet: "",
    email: initialEmail,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setFormData((prev) => ({ ...prev, email: initialEmail || "" }))
  }, [isOpen, initialEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await addAbonne({
        nomComplet: formData.nomComplet.trim(),
        email: formData.email.trim(),
      })

      setIsSubmitted(true)
      onSuccess?.()

      setTimeout(() => {
        setIsSubmitted(false)
        onClose()
      }, 1500)
    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description: error instanceof Error ? error.message : "Une erreur est survenue.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({ nomComplet: "", email: "" })
    setIsSubmitted(false)
    onClose()
  }

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Inscription réussie !</h3>
            <p className="text-muted-foreground">
              Merci {formData.nomComplet} ! Vous recevrez bientôt nos dernières actualités.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Mail className="h-5 w-5 text-white" />
            </div>
            Abonnez-vous à notre Newsletter
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-6 text-muted-foreground">
            Recevez les dernières nouvelles, événements et enseignements directement dans votre boîte mail.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="newsletter-name">Nom complet *</Label>
              <Input
                id="newsletter-name"
                value={formData.nomComplet}
                onChange={(e) => setFormData({ ...formData, nomComplet: e.target.value })}
                placeholder="Votre nom complet"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="newsletter-email">Adresse email *</Label>
              <Input
                id="newsletter-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="votre@email.com"
                required
                className="mt-1"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={isSubmitting}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Inscription..." : "S'abonner"}
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Pas de spam, désabonnement possible à tout moment.
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
