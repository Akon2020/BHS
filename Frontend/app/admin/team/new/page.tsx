"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, Upload, ImageIcon } from "lucide-react";
import Link from "next/link";

export default function NewTeamMemberPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [memberData, setMemberData] = useState({
    name: "",
    role: "",
    bio: "",
    order: 0,
    image: null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setMemberData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!memberData.name || !memberData.role || !memberData.bio) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Membre ajouté!",
        description: "Le membre a été ajouté à l'équipe avec succès.",
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/team">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Ajouter un Membre</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nom complet <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nom et prénom"
                    value={memberData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">
                    Rôle / Fonction <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="role"
                    name="role"
                    placeholder="Ex: Père Principal, Responsable Jeunesse, etc."
                    value={memberData.role}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">
                    Biographie <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Une courte biographie du membre"
                    rows={5}
                    value={memberData.bio}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Ordre d'affichage</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    placeholder="Position dans la liste (1 = premier)"
                    value={memberData.order.toString()}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Détermine l'ordre d'affichage sur la page d'équipe. Les
                    nombres plus petits apparaissent en premier.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Photo de profil</h3>

              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-md p-6 text-center">
                  <div className="mb-4">
                    <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden bg-secondary">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    Glissez-déposez une image ou cliquez pour parcourir
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    JPG, PNG ou GIF. Taille recommandée 300x300px.
                  </p>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Parcourir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}