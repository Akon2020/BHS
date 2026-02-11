import Image from "next/image"
import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react"
import { NewsletterSubscribeForm } from "@/components/newsletter-subscribe-form"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center">
              <Image src="/images/logon.png" alt="Burning Heart" width={100} height={100} className="h-16 w-auto" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Communauté dédiée à raviver la flamme de l'espérance dans vos coeur. Rejoignez notre communauté pour
              grandir spirituellement, trouver du soutien et discerner la volonté de Dieu dans votre vie.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="https://www.facebook.com/burningheart87"
                className="rounded-full bg-background p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.instagram.com/burningheart87"
                className="rounded-full bg-background p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.youtube.com/@burningheart-bhis"
                className="rounded-full bg-background p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Liens Rapides</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/a-propos" className="text-sm text-muted-foreground hover:text-foreground">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-sm text-muted-foreground hover:text-foreground">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/evenements" className="text-sm text-muted-foreground hover:text-foreground">
                  Événements
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <span>259 Avenue Patrice Emery Lumumba, Q. Nyalukemba, Bukavu, République Démocratique du Congo</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <a
                  href="tel:+243849005240"
                  className="text-muted-foreground transition-colors duration-200 hover:text-primary hover:underline"
                >
                  +243 849 005 240
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-5 w-5 shrink-0 text-primary" />
                <a
                  href="mailto:burningheartihs@gmail.com"
                  className="text-muted-foreground transition-colors duration-200 hover:text-primary hover:underline"
                >
                  burningheartihs@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Newsletter</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Inscrivez-vous pour recevoir nos dernières nouvelles et événements.
            </p>
            <NewsletterSubscribeForm variant="footer" />
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">© 2025 Burning Heart. Tous droits réservés.</p>
          <div className="mt-2 flex justify-center gap-4 text-sm">
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              Mentions légales
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              Politique de confidentialité
            </Link>
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">
              Administration
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
