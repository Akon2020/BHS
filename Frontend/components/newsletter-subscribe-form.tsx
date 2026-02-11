"use client"

import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NewsletterModal } from "@/components/modals/newsletter-modal"

type Variant = "footer" | "home"

interface NewsletterSubscribeFormProps {
  variant: Variant
}

export function NewsletterSubscribeForm({ variant }: NewsletterSubscribeFormProps) {
  const [email, setEmail] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  const handleSuccess = () => {
    setEmail("")
  }

  if (variant === "footer") {
    return (
      <>
        <form className="mt-4 flex flex-col gap-2" onSubmit={openModal}>
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Inscription
          </button>
        </form>
        <NewsletterModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialEmail={email}
          onSuccess={handleSuccess}
        />
      </>
    )
  }

  return (
    <>
      <form className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={openModal}>
        <Input
          type="email"
          placeholder="Votre adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-white"
        />
        <Button type="submit" variant="secondary" className="shrink-0 bg-white text-primary hover:bg-white/90">
          Inscription
        </Button>
      </form>
      <NewsletterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialEmail={email}
        onSuccess={handleSuccess}
      />
    </>
  )
}
