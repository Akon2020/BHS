"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { hasAccessToPage } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Mail,
  Calendar,
  Home,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Folder,
  LogOut,
  MessageSquare,
  MessageSquareText,
  IdCard,
  UserPlus,
  Tags,
  Timer,
  Quote,
  HandHeart,
  CalendarClock,
  CalendarDays,
  Cake,
  ListTodo,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logout } from "@/actions/auth";

interface SidebarProps {
  /** Mode réduit (icônes seules) sur desktop. */
  collapsed: boolean;
  /** Bascule le mode réduit (desktop). */
  onToggleCollapse: () => void;
  /** Drawer ouvert sur mobile/tablette. */
  mobileOpen: boolean;
  /** Ferme le drawer mobile. */
  onMobileClose: () => void;
}

export default function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/connexion");
      router.refresh();
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
      toast?.error("Impossible de se déconnecter");
    }
  };

  const menuGroups = [
    {
      label: "Général",
      items: [
        {
          label: "Tableau de bord",
          icon: LayoutDashboard,
          href: "/admin",
          active: pathname === "/admin",
        },
        {
          label: "Calendrier",
          icon: CalendarDays,
          href: "/admin/calendrier",
          active: pathname.startsWith("/admin/calendrier"),
        },
      ],
    },
    {
      label: "Contenu",
      items: [
        {
          label: "Blog",
          icon: FileText,
          href: "/admin/blog",
          active: pathname.startsWith("/admin/blog"),
        },
        {
          label: "Catégories",
          icon: Tags,
          href: "/admin/categories",
          active: pathname.startsWith("/admin/categories"),
        },
        {
          label: "Commentaires",
          icon: MessageSquareText,
          href: "/admin/comments",
          active: pathname.startsWith("/admin/comments"),
        },
        {
          label: "Témoignages",
          icon: Quote,
          href: "/admin/temoignages",
          active: pathname.startsWith("/admin/temoignages"),
        },
        {
          label: "Événements",
          icon: Calendar,
          href: "/admin/events",
          active: pathname.startsWith("/admin/events"),
        },
        {
          label: "Fichiers",
          icon: Folder,
          href: "/admin/files",
          active: pathname === "/admin/files",
        },
      ],
    },
    {
      label: "Membres",
      items: [
        {
          label: "Utilisateurs",
          icon: Users,
          href: "/admin/users",
          active: pathname.startsWith("/admin/users"),
        },
        {
          label: "Identités",
          icon: IdCard,
          href: "/admin/identities",
          active: pathname.startsWith("/admin/identities"),
        },
        {
          label: "Équipe (Membre interne)",
          icon: Users,
          href: "/admin/team",
          active: pathname.startsWith("/admin/team"),
        },
      ],
    },
    {
      label: "Communication",
      items: [
        {
          label: "Messages",
          icon: MessageSquare,
          href: "/admin/contact",
          active: pathname.startsWith("/admin/contact"),
        },
        {
          label: "Newsletter",
          icon: Mail,
          href: "/admin/newsletter",
          active: pathname.startsWith("/admin/newsletter"),
        },
        {
          label: "Abonnés Newsletter",
          icon: UserPlus,
          href: "/admin/abonnes",
          active: pathname.startsWith("/admin/abonnes"),
        },
      ],
    },
    {
      label: "Organisation",
      items: [
        {
          label: "Agenda / RDV",
          icon: CalendarClock,
          href: "/admin/agenda",
          active: pathname.startsWith("/admin/agenda"),
        },
        {
          label: "Tâches",
          icon: ListTodo,
          href: "/admin/taches",
          active: pathname.startsWith("/admin/taches"),
        },
        {
          label: "Anniversaires",
          icon: Cake,
          href: "/admin/anniversaires",
          active: pathname.startsWith("/admin/anniversaires"),
        },
        {
          label: "Pointage",
          icon: Timer,
          href: "/admin/pointage",
          active: pathname.startsWith("/admin/pointage"),
        },
      ],
    },
    {
      label: "Finances",
      items: [
        {
          label: "Dons",
          icon: HandHeart,
          href: "/admin/dons",
          active: pathname.startsWith("/admin/dons"),
        },
      ],
    },
    {
      label: "Compte",
      items: [
        {
          label: "Profil",
          icon: UserCircle,
          href: "/admin/profile",
          active: pathname === "/admin/profile",
        },
        {
          label: "Paramètres",
          icon: Settings,
          href: "/admin/settings",
          active: pathname === "/admin/settings",
        },
      ],
    },
  ];

  // Filtrer les items selon le rôle, puis retirer les groupes devenus vides.
  const groups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (route) => user && hasAccessToPage(user.role, route.href),
      ),
    }))
    .filter((group) => group.items.length > 0);

  // Le label est masqué uniquement en mode réduit ET sur desktop (≥ lg).
  // Sur mobile le drawer est toujours pleine largeur, donc on garde les libellés.
  const labelHidden = collapsed ? "lg:hidden" : "";

  return (
    <>
      {/* Backdrop (mobile uniquement) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r bg-background transition-[transform,width] duration-300 ease-in-out",
          // Mobile : drawer pleine largeur, masqué hors écran par défaut
          "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop : statique, largeur selon le mode réduit
          "lg:static lg:z-auto lg:translate-x-0",
          collapsed ? "lg:w-16" : "lg:w-64",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-3">
          <Link
            href="/admin"
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-2 font-semibold transition-opacity",
              collapsed ? "lg:opacity-0" : "opacity-100",
            )}
          >
            <span className="font-bold text-primary">Burning Heart</span>
          </Link>

          {/* Toggle réduit (desktop) */}
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 lg:flex"
            aria-label={collapsed ? "Déplier le menu" : "Réduire le menu"}
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </Button>

          {/* Fermer le drawer (mobile) */}
          <Button
            onClick={onMobileClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </Button>
        </div>

        <ScrollArea className="min-h-0 flex-1 py-2">
          <nav className="flex flex-col gap-1 px-2">
            {groups.map((group) => (
              <div key={group.label} className="flex flex-col gap-1">
                {/* Titre de groupe (masqué en mode réduit sur desktop) */}
                <p
                  className={cn(
                    "px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70",
                    collapsed && "lg:hidden",
                  )}
                >
                  {group.label}
                </p>
                {group.items.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={onMobileClose}
                    title={route.label}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent",
                      collapsed && "lg:justify-center",
                      route.active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <route.icon size={20} className="shrink-0" />
                    <span className={cn("truncate", labelHidden)}>
                      {route.label}
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="mt-auto border-t p-2">
          <Button
            variant="ghost"
            asChild
            className={cn(
              "mb-1 w-full justify-start gap-3",
              collapsed && "lg:justify-center",
            )}
          >
            <Link href="/" onClick={onMobileClose}>
              <Home size={20} className="shrink-0" />
              <span className={cn(labelHidden)}>Retour à l'accueil</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start gap-3 border-t text-destructive hover:text-destructive",
              collapsed && "lg:justify-center",
            )}
          >
            <LogOut size={20} className="shrink-0" />
            <span className={cn(labelHidden)}>Déconnexion</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
