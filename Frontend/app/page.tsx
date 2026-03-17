"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  MapPin,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { toast } from "@/components/ui/use-toast";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { UpcomingEventsSection } from "@/components/sections/upcoming-events";
import { NewsletterSubscribeForm } from "@/components/newsletter-subscribe-form";
import { DepartmentsSection } from "@/components/sections/departments";
import { createContact } from "@/actions/contact";

export default function HomePage() {
  const [formData, setFormData] = useState({
    nomComplet: "",
    email: "",
    sujet: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id === "name"
        ? "nomComplet"
        : id === "email"
          ? "email"
          : id === "subject"
            ? "sujet"
            : "message"]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createContact(formData);

      setFormData({
        nomComplet: "",
        email: "",
        sujet: "",
        message: "",
      });

      toast({
        title: "Message envoyé",
        description: "Merci pour votre message. Nous vous répondrons bientôt.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error.message ||
          "Une erreur est survenue lors de l'envoi du message.",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col">
      <Header />
      {/* Hero Section with Background Image */}
      <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/bg.jpg"
            alt="Burning Heart Hero"
            fill
            className="object-cover brightness-50"
            priority
          />
          <div className="absolute inset-0 from-black/60 via-black/40 to-background" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 text-center lg:px-8">
          <h1 className="text-balance font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Ravivez la flamme de votre foi
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-gray-200">
            Rejoignez une communauté spirituelle dédiée à grandir dans la foi,
            trouver du soutien et discerner la volonté de Dieu dans votre vie
            quotidienne.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/a-propos">
              <Button size="lg" className="gap-2">
                Découvrir notre mission
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              >
                Nous rejoindre
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* À Propos de Nous Section */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Logo Image */}
            <div className="flex justify-center lg:justify-start">
              <Image
                src="/images/logon.png"
                alt="Burning Heart Logo"
                width={400}
                height={400}
                className="w-full max-w-md"
              />
            </div>

            {/* Content */}
            <div className="space-y-6">
              <h2 className="font-serif text-4xl font-bold tracking-tight text-primary">
                À Propos de Nous
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <span className="font-semibold text-foreground">
                    Burning Heart - Pèlerins avec le Christ
                  </span>{" "}
                  est un apostolat spirituel et médiatique à but non lucratif
                  désirant soutenir les préférences apostoliques universelles de
                  la Compagnie de Jésus concernant l'aide à porter aux âmes, à
                  trouver Jésus-Christ et à le suivre.
                </p>
                <p>
                  Il se veut un outil pour la{" "}
                  <span className="font-semibold text-foreground">
                    promotion du discernement et des Exercices Spirituels
                  </span>{" "}
                  et devra{" "}
                  <span className="font-semibold text-foreground">
                    cheminer avec les jeunes, les accompagner dans la création
                    d'un avenir plein d'espoir.
                  </span>
                </p>
              </div>

              {/* Mission & Vision */}
              <div className="grid gap-6 sm:grid-cols-2 mt-8">
                <Card className="bg-muted/30 border-none">
                  <CardContent className="p-6">
                    <h3 className="font-serif text-xl font-bold mb-3">
                      Notre Mission
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Ouvrir l'accès aux exercices spirituels à tous les hommes
                      assoiffés de Dieu pour qu'ils en jouissent et s'attachent
                      au créateur de toute chose.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-none">
                  <CardContent className="p-6">
                    <h3 className="font-serif text-xl font-bold mb-3">
                      Notre Vision
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Devenir un outil de rayonnement spirituel et une référence
                      pour l'expansion évangélique à travers les Exercices
                      Spirituels.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-4">
                <Link href="/a-propos">
                  <Button className="gap-2 w-full" size="lg">
                    En savoir plus
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Départements Section */}
      <DepartmentsSection />

      {/* Événements à Venir Section */}
      <UpcomingEventsSection />

      {/* Témoignages Section */}
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold tracking-tight">
              Témoignages
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
              Découvrez comment Burning Heart a impacté la vie de nos membres.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8 sm:p-12">
                <div className="flex justify-center mb-6">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-3xl font-serif text-muted-foreground">
                      SD
                    </span>
                  </div>
                </div>
                <div className="text-center mb-6">
                  <svg
                    className="mx-auto h-12 w-12 text-primary/20 mb-4"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                  >
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <p className="text-lg leading-relaxed text-foreground italic">
                    Burning Heart a complètement transformé ma vie spirituelle.
                    J'ai trouvé ici une famille qui me soutient dans tous les
                    aspects de ma vie.
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">Samuel Diambu</p>
                  <p className="text-sm text-muted-foreground">
                    Membre depuis 2018
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-transparent"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter - Restez Informé Section */}
      <section className="py-24 bg-primary">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
              Restez Informé
            </h2>
            <p className="text-lg text-white/90 leading-relaxed mb-8">
              Inscrivez-vous à notre newsletter pour recevoir les dernières
              nouvelles, événements et enseignements directement dans votre
              boîte mail.
            </p>
            <NewsletterSubscribeForm variant="home" />
            <p className="text-sm text-white/70 mt-4">
              Nous respectons votre vie privée. Vous pouvez vous désabonner à
              tout moment.
            </p>
          </div>
        </div>
      </section>

      {/* Contactez-Nous Section */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold tracking-tight">
              Contactez-Nous
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
              Nous sommes là pour répondre à vos questions et vous accueillir
              dans notre communauté.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-5 lg:gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">
                  Plusieurs façons de nous contacter
                </h3>

                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Adresse</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        259 Avenue Patrice Emery Lumumba, Q. Nyalukemba, Bukavu,
                        République Democratique du Congo
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Téléphone</h4>
                      <a
                        href="tel:+243849005240"
                        className="text-sm text-primary hover:underline"
                      >
                        +243 849 005 240
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Email</h4>
                      <p>
                      <a
                        href="mailto:contact@burningheartihs.org"
                        className="text-sm text-primary hover:underline"
                      >
                        contact@burningheartihs.org
                      </a>
                      </p>
                      <p>
                      <a
                        href="mailto:burningheartihs@gmail.com"
                        className="text-sm text-primary hover:underline"
                      >
                        burningheartihs@gmail.com
                      </a>
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Horaire d'ouverture</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Lundi - Vendredi: 16h00 - 17h00 (Sur rendez-vous)</p>
                        <p>Samedi: 15h00 - 17h00</p>
                        <p>Dimanche: 8h00 - 12h00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3986.0225212120026!2d28.87330107577174!3d-2.4994653381572034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19c2974c3bce9397%3A0x1519f32559211e7d!2sColl%C3%A8ge%20Alfajiri!5e0!3m2!1sfr!2scd!4v1764982349518!5m2!1sfr!2scd"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Burning Heart Location"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card className="border-none shadow-lg">
                <CardContent className="p-8">
                  <h3 className="font-serif text-2xl font-bold mb-2">
                    Envoyez-nous un message
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Remplissez le formulaire ci-dessous et nous vous répondrons
                    rapidement
                  </p>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Nom complet{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="name"
                          placeholder="Votre nom et prénom"
                          required
                          value={formData.nomComplet}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="votre@email.com"
                          required
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Sujet
                      </label>
                      <Input
                        id="subject"
                        placeholder="Sujet de votre message"
                        value={formData.sujet}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Écrivez votre message ici..."
                        rows={15}
                        required
                        value={formData.message}
                        onChange={handleChange}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? "Envoi..." : "Envoyer le message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
