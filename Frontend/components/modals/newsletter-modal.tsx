"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, CheckCircle } from "lucide-react"
import { addAbonne } from "@/actions/abonne"

interface NewsletterModalProps {
  isOpen: boolean
  onClose: () => void
  initialEmail?: string
}

export function NewsletterModal({ isOpen, onClose, initialEmail = "" }: NewsletterModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: initialEmail,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Auto-fill email when modal opens
  useEffect(() => {
    if (isOpen && initialEmail) {
      setFormData((prev) => ({ ...prev, email: initialEmail }))
    }
  }, [isOpen, initialEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulation de l'envoi
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)

    // Auto-close after success
    setTimeout(() => {
      setIsSubmitted(false)
      onClose()
    }, 2000)
  }

  const handleClose = () => {
    setFormData({ name: "", email: "" })
    setIsSubmitted(false)
    onClose()
  }

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-[#1E7555] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Inscription Réussie !</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Merci {formData.name} ! Vous recevrez bientôt nos dernières actualités.
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
            <div className="w-10 h-10 bg-gradient-to-br bg-primary rounded-full flex items-center justify-center mr-3">
              <Mail className="h-5 w-5 text-white" />
            </div>
            Abonnez-vous à notre Newsletter
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Recevez les dernières annonces immobilières et actualités directement dans votre boîte mail.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="newsletter-name">Nom complet *</Label>
              <Input
                id="newsletter-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-[#911a0f] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Inscription..." : "S'abonner"}
              </Button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Pas de spam, désabonnement possible à tout moment
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
