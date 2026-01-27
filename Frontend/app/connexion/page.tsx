"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { login } from "@/lib/auth"
import { login } from "@/actions/auth";
import { LogIn } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    /* const user = login({email: formData.email, password: formData.password})
    console.log("Utilisateur Connecté:", user)
    if (user) {
      router.push("/admin")
    } else {
      setError("Email ou mot de passe incorrect")
    } */
    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });
      console.log("Réponse complète:", response);
      console.log({ email: formData.email, password: formData.password });

      // Vérifier si la réponse contient une erreur
      if (response?.data?.message) {
        // C'est une erreur retournée par le backend
        setError(response.data.message);
        return;
      }
      const user = response?.userInfo;

      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      toast({
        title: "Connexion réussie",
        description: `Vous êtes maintenant connecté en tant que ${response?.userInfo?.nomComplet || formData.email}.`,
      })

      // localStorage.setItem("token", response.token);

      // Rediriger vers la page demandée ou le dashboard
      router.push("/admin");
    } catch (error) {
      console.error("Erreur de connexion:", error)
      
      // Gérer différents types d'erreurs
      if (error?.response?.data?.message) {
        // Erreur de l'API
        setError(error.response.data.message)
      } else if (error?.message) {
        // Erreur JavaScript
        setError(error.message)
      } else {
        // Erreur générique
        setError("Une erreur est survenue lors de la connexion")
      }

      toast({
        title: "Erreur de connexion",
        description: "Identifiants incorrects. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md px-4">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-3xl">Connexion</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Accédez à l'espace d'administration
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="admin@burningheart.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" className="w-full gap-2">
                <LogIn className="h-4 w-4" />
                Se connecter
              </Button>

              {/* <div className="rounded-md bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground">
                  <strong>Identifiants de démonstration:</strong>
                  <br />
                  Email: admin@burningheart.com
                  <br />
                  Mot de passe: admin123
                </p>
              </div> */}
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Retour à l'accueil
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
