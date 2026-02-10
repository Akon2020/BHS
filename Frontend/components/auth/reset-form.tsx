"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { resetPassword } from "@/actions/auth";
import { toast } from "@/components/ui/use-toast";

function ResetFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  useEffect(() => {
    if (!token) {
      setInvalidToken(true);
      toast({
        title: "Token manquant",
        description: "Lien de réinitialisation invalide",
      });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirm) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      toast({ title: "Succès", description: res.message });
      router.push("/connexion");
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (invalidToken) {
    return (
      <Card className="border-none shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Token invalide</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Le lien de réinitialisation est invalide ou a expiré
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/connexion/reset-request">
            <Button variant="outline">Demander un nouveau lien</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="font-serif text-2xl">
          Réinitialiser le mot de passe
        </CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          Entrez un nouveau mot de passe
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/connexion"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Retour à la connexion
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function ResetFormSkeleton() {
  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export function ResetForm() {
  return (
    <>
      <ResetFormContent />
    </>
  );
}

export { ResetFormSkeleton };
