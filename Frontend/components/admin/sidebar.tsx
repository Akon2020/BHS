"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  Mail,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function AdminSidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Tableau de bord",
      icon: LayoutDashboard,
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      label: "Utilisateurs",
      icon: Users,
      href: "/admin/users",
      active: pathname === "/admin/users",
    },
    {
      label: "Blog",
      icon: FileText,
      href: "/admin/blog",
      active: pathname.startsWith("/admin/blog"),
    },
    {
      label: "Newsletter",
      icon: Mail,
      href: "/admin/newsletter",
      active: pathname.startsWith("/admin/newsletter"),
    },
    {
      label: "Événements",
      icon: Calendar,
      href: "/admin/events",
      active: pathname.startsWith("/admin/events"),
    },
    {
      label: "Équipe",
      icon: Users,
      href: "/admin/team",
      active: pathname.startsWith("/admin/team"),
    },
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
  ]

  return (
    <div
      className={cn(
        "group/sidebar h-screen bg-background border-r relative transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-[70px]",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-3 justify-between">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-2 font-semibold transition-opacity",
              isOpen ? "opacity-100" : "opacity-0",
            )}
          >
            <span className="text-primary font-bold">Burning Heart</span>
          </Link>
          <Button onClick={onToggle} variant="ghost" size="icon" className="h-8 w-8">
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </Button>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent",
                  route.active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
              >
                <route.icon size={20} />
                <span className={cn("transition-opacity", isOpen ? "opacity-100" : "opacity-0")}>{route.label}</span>
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="mt-auto border-t p-2">
          <Link href="/auth/logout">
            <Button variant="ghost" className={cn("w-full justify-start gap-3", isOpen ? "" : "justify-center")}>
              <LogOut size={20} />
              <span className={cn("transition-opacity", isOpen ? "opacity-100" : "opacity-0")}>Déconnexion</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
