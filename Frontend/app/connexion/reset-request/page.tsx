"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/actions/auth";
import { toast } from "@/components/ui/use-toast";

export default function ResetRequestPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentUrl, setSentUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      toast({ title: "Email envoyé", description: res.message });
      if (res.dev?.resetUrl) setSentUrl(res.dev.resetUrl);
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

  return (
    <div className="flex h-screen items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md px-4">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">
              Mot de passe oublié
            </CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Envoi..." : "Envoyer le lien"}
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
      </div>
    </div>
  );
}
