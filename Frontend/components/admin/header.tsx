"use client";

import Link from "next/link";
import { Menu, Bell, User, Settings, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logout } from "@/actions/auth";
import {
  getCurrentUser,
  getRoleLabel,
  getUserDisplayName,
  getUserInitials,
} from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

export default function AdminHeader({ toggleSidebar }: AdminHeaderProps) {
  const notifications = 3;
  const currentUser = getCurrentUser();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button
        variant="outline"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
      <div className="flex-1">
        <h1 className="text-xl font-bold">Tableau de bord</h1>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {notifications}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Nouvel utilisateur inscrit</DropdownMenuItem>
            <DropdownMenuItem>Nouveau commentaire sur le blog</DropdownMenuItem>
            <DropdownMenuItem>Mise à jour système disponible</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Mon compte"
            >
              <Avatar className="size-9 border">
                <AvatarImage
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${currentUser?.avatar || undefined}`}
                  alt={getUserDisplayName(currentUser)}
                  className="object-cover"
                />
                <AvatarFallback className="text-xs font-semibold">
                  {getUserInitials(currentUser)}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Mon compte</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <div className="space-y-2 px-2 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">
                  {getUserDisplayName(currentUser)}
                </p>
                <Badge variant="secondary">
                  {getRoleLabel(currentUser?.role)}
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {currentUser?.email || "Email inconnu"}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/admin/profil" className="flex items-center gap-2">
                <User className="mr-2 h-4 w-4" />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/admin/settings" className="flex items-center gap-2">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
