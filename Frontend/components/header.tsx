"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Moon,
  Sun,
  X,
  Heart,
  User,
  Settings,
  LogOut,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/theme-context";
import {
  getCurrentUser,
  getRoleLabel,
  getUserDisplayName,
  getUserInitials,
  User as AuthUser,
} from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { logout as logoutAction } from "@/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const navigation = [
  { name: "Accueil", href: "/" },
  { name: "À propos", href: "/a-propos" },
  { name: "Services", href: "/services" },
  { name: "Événements", href: "/events" },
  { name: "Blog", href: "/blog" },
  { name: "Fichiers", href: "/files" },
  { name: "Rendez-vous", href: "/rendez-vous" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getCurrentUser());

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("focus", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("focus", syncUser);
    };
  }, []);

  const authenticated = !!currentUser;

  const handleLogout = async () => {
    try {
      await logoutAction();
      setCurrentUser(null);
      setMobileMenuOpen(false);
      router.push("/connexion");
      router.refresh();
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
      toast.error("Impossible de se déconnecter");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 px-4 py-4 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Burning Heart</span>
            <Image
              src="/images/logon.png"
              alt="Burning Heart"
              width={120}
              height={120}
              className="h-12 w-auto"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex flex-1 items-center justify-end gap-x-2 sm:gap-x-4">
          <Link href="/recherche" aria-label="Rechercher">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/don" className="hidden sm:block">
            <Button variant="default" size="sm" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden md:inline">Faire un Don</span>
              <span className="md:hidden">Don</span>
            </Button>
          </Link>

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

          {authenticated ? (
            <>
              <Link href="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex bg-transparent"
                >
                  Administration
                </Button>
              </Link>
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
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
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
                    <Link href="/admin/profile" className="flex items-center gap-2">
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
            </>
          ) : (
            <Link href="/connexion">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex bg-transparent"
              >
                Connexion
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/recherche"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium transition-colors ${
                pathname === "/recherche"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <Search className="h-4 w-4" />
              Rechercher
            </Link>
            <div className="pt-4 space-y-2">
              <Link href="/don" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" size="sm" className="w-full gap-2">
                  <Heart className="h-4 w-4" />
                  Faire un Don
                </Button>
              </Link>
              {authenticated ? (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    Administration
                  </Button>
                </Link>
              ) : (
                <Link
                  href="/connexion"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    Connexion
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
