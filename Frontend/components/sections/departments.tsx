"use client";

import {
  Building2,
  Camera,
  ClipboardList,
  Coins,
  Compass,
  Cross,
  Eye,
  FileText,
  Globe,
  HandCoins,
  Heart,
  Image as ImageIcon,
  Landmark,
  Lightbulb,
  Music,
  Palette,
  Scale,
  Scissors,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Smile,
  Sparkles,
  Truck,
  Users,
  Video,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

type IconKey = string;

interface OfficeItem {
  name: string;
  icon: IconKey;
  description: string;
}

interface DepartmentItem {
  name: string;
  icon: IconKey;
  description: string;
  offices: OfficeItem[];
}

interface DepartmentsData {
  departments: DepartmentItem[];
}

const departmentsData: DepartmentsData = {
  departments: [
    {
      name: "Coordination et Ressources Humaines",
      icon: "users",
      description:
        "Ce département assure la coordination générale du groupe, l’organisation interne et la gestion des ressources humaines. Il veille à l’harmonie entre les différents services, supervise les activités et garantit le bon fonctionnement administratif et disciplinaire du groupe.",
      offices: [
        {
          name: "Coordinateur",
          icon: "compass",
          description:
            "Assure la direction générale du groupe, coordonne les orientations et supervise l’ensemble des activités et départements.",
        },
        {
          name: "Admoniteur",
          icon: "shield-check",
          description:
            "Assure la relecture, la validation et la censure des contenus avant leur diffusion sur les médias afin de garantir leur conformité avec la vision spirituelle du groupe.",
        },
        {
          name: "Animateur spirituel",
          icon: "sparkles",
          description:
            "Encourage la vie spirituelle des membres, accompagne les moments de prière et favorise la croissance spirituelle au sein du groupe.",
        },
        {
          name: "Superviseurs",
          icon: "eye",
          description:
            "Accompagnent et supervisent les activités des membres afin d’assurer le bon déroulement des actions et le respect des orientations du groupe.",
        },
        {
          name: "Assistant (Ressources humaines)",
          icon: "user-cog",
          description:
            "Coordonne les activités des départements, gère les ressources humaines, représente le groupe dans certaines relations extérieures, accompagne les activités opérationnelles et organise les réunions.",
        },
        {
          name: "Secrétariat",
          icon: "file-text",
          description:
            "Gère l’administration du groupe, organise les réunions, rédige les procès-verbaux, gère les correspondances, archive les documents et assure la circulation de l’information.",
        },
        {
          name: "Discipline",
          icon: "gavel",
          description:
            "Veille au respect des règles, des valeurs et de la discipline interne du groupe afin de maintenir un climat d’ordre et de responsabilité.",
        },
      ],
    },
    {
      name: "Biens Temporels",
      icon: "wallet",
      description:
        "Ce département gère les ressources matérielles et financières du groupe. Il veille à la transparence financière, à la gestion du matériel, à la planification des projets et à la mobilisation des ressources nécessaires aux activités.",
      offices: [
        {
          name: "Économe",
          icon: "landmark",
          description:
            "Assure la gestion financière globale du groupe, garantit la transparence des opérations financières, sécurise les fonds et produit les rapports financiers périodiques.",
        },
        {
          name: "Logistique",
          icon: "truck",
          description:
            "Gère le matériel du groupe, organise l’inventaire, supervise les achats ou locations d’équipements et prépare les installations nécessaires aux réunions et événements.",
        },
        {
          name: "Caissier",
          icon: "coins",
          description:
            "Assure la gestion quotidienne des fonds, effectue les paiements autorisés, vérifie les pièces justificatives et conserve les documents financiers.",
        },
        {
          name: "Programme et Fund-raising",
          icon: "hand-coins",
          description:
            "Conçoit et planifie les projets du groupe, recherche des partenaires et financements, coordonne l’exécution des activités, assure le suivi des projets et prépare les rapports d’évaluation.",
        },
        {
          name: "Commercial",
          icon: "shopping-cart",
          description:
            "Planifie et coordonne la commercialisation des produits du groupe, réalise des études de marché, définit les stratégies marketing et organise les circuits de distribution.",
        },
      ],
    },
    {
      name: "Édification Spirituelle",
      icon: "church",
      description:
        "Ce département est responsable de la croissance spirituelle des membres et de l’organisation des activités liturgiques et de prière conformément à la tradition de l’Église catholique.",
      offices: [
        {
          name: "Liturgie et chants",
          icon: "music",
          description:
            "Organise et coordonne les célébrations liturgiques, prépare les programmes de prière, supervise les équipes de chant et veille au respect des normes liturgiques.",
        },
        {
          name: "Orant",
          icon: "hands-praying",
          description:
            "Anime et soutient les moments de prière et d’intercession pour la communauté et accompagne les temps spirituels.",
        },
        {
          name: "Animation vocationnelle",
          icon: "lightbulb",
          description:
            "Encourage les vocations spirituelles et accompagne les membres dans leur discernement et leur engagement au service de Dieu.",
        },
      ],
    },
    {
      name: "Production Médias",
      icon: "video",
      description:
        "Ce département traduit la vision spirituelle du groupe à travers les médias. Il coordonne la production de contenus visuels, vidéos et numériques et assure la communication du groupe sur les différentes plateformes.",
      offices: [
        {
          name: "Infographie",
          icon: "palette",
          description:
            "Conçoit les visuels, affiches et supports graphiques nécessaires à la communication du groupe.",
        },
        {
          name: "Filmage",
          icon: "camera",
          description:
            "Capture les activités et événements du groupe afin de documenter et valoriser les actions réalisées.",
        },
        {
          name: "Montage",
          icon: "scissors",
          description:
            "Assemble les séquences vidéo, crée des contenus audiovisuels promotionnels, ajoute effets et sous-titres, optimise les contenus pour les réseaux sociaux et archive les productions.",
        },
        {
          name: "Photographie",
          icon: "image",
          description:
            "Réalise les photographies des événements et constitue une mémoire visuelle des activités du groupe.",
        },
        {
          name: "Réseaux sociaux",
          icon: "share-2",
          description:
            "Diffuse les contenus produits sur les plateformes numériques et assure la visibilité des activités du groupe.",
        },
        {
          name: "Webmaster",
          icon: "globe",
          description:
            "Gère le site web du groupe, publie les contenus numériques et assure la présence en ligne du mouvement.",
        },
      ],
    },
    {
      name: "Social",
      icon: "heart-handshake",
      description:
        "Ce département organise la vie sociale du groupe et les actions de solidarité. Il promeut la fraternité, l’accueil, la charité chrétienne et veille au bon déroulement des activités communautaires.",
      offices: [
        {
          name: "Propreté",
          icon: "broom",
          description:
            "Assure le nettoyage des espaces, la gestion des déchets, le suivi du matériel de nettoyage et le maintien d’un environnement propre et accueillant.",
        },
        {
          name: "Protocole",
          icon: "clipboard-list",
          description:
            "Organise et structure les activités, veille au respect de l’ordre du jour, coordonne l’accueil des participants et assure la bonne conduite des événements.",
        },
        {
          name: "Bien-être",
          icon: "smile",
          description:
            "Favorise la fraternité entre les membres, organise des activités sociales et veille au bien-être et à l’intégration de chacun.",
        },
        {
          name: "Sécurité",
          icon: "shield",
          description:
            "Garantit la sécurité des membres et du matériel, maintient l’ordre durant les activités et prévient les situations pouvant perturber le bon déroulement des rencontres.",
        },
      ],
    },
  ],
};

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  compass: Compass,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  eye: Eye,
  "user-cog": Settings,
  "file-text": FileText,
  gavel: Scale,
  wallet: Wallet,
  landmark: Landmark,
  truck: Truck,
  coins: Coins,
  "hand-coins": HandCoins,
  "shopping-cart": ShoppingCart,
  church: Cross,
  music: Music,
  "hands-praying": Heart,
  lightbulb: Lightbulb,
  video: Video,
  palette: Palette,
  camera: Camera,
  scissors: Scissors,
  image: ImageIcon,
  "share-2": Share2,
  globe: Globe,
  "heart-handshake": Heart,
  broom: Building2,
  "clipboard-list": ClipboardList,
  smile: Smile,
  shield: Shield,
};

function resolveIcon(iconKey: string): LucideIcon {
  return iconMap[iconKey] || Building2;
}

export function DepartmentsSection() {
  return (
    <section className="bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="font-serif text-4xl font-bold tracking-tight">
            Nos Départements
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
            Découvrez les différentes façons dont nous nous impliquons dans la
            communauté et la faisons grandir.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {departmentsData.departments.map((department, index) => {
            const DepartmentIcon = resolveIcon(department.icon);

            return (
              <Card
                key={department.name}
                className="border-border/60 bg-background/90 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="mb-5 flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <DepartmentIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold leading-tight">
                        {department.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {department.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <Badge variant="secondary" className="font-normal">
                      {department.offices.length} offices
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Département {index + 1}
                    </span>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    {department.offices.map((office) => {
                      const OfficeIcon = resolveIcon(office.icon);

                      return (
                        <AccordionItem key={office.name} value={`${department.name}-${office.name}`}>
                          <AccordionTrigger className="py-3 hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <OfficeIcon className="h-4 w-4" />
                              </span>
                              <span className="font-medium">{office.name}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="pl-11 pr-2 text-sm leading-relaxed text-muted-foreground">
                              {office.description}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
