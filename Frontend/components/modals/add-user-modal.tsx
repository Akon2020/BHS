"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { createUser } from "@/actions/users";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddUserModal({
  isOpen,
  onClose,
  onSuccess,
}: AddUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "membre",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // pour prévisualiser
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData.name || !userData.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await createUser({
        nomComplet: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: avatarFile || undefined,
      });

      toast({
        title: "Utilisateur créé",
        description: `L'utilisateur ${response?.nomComplet || userData.name} a été créé avec succès.`,
      });

      setUserData({ name: "", email: "", role: "membre" });
      setAvatarFile(null);
      setAvatarPreview(null);

      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error?.message ||
          "Une erreur est survenue lors de la création de l'utilisateur.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Créez un nouvel utilisateur en remplissant les informations
              ci-dessous.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Nom */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                name="name"
                value={userData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            {/* Email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            {/* Rôle */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rôle
              </Label>
              <Select
                value={userData.role}
                onValueChange={(value) => handleSelectChange("role", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="editeur">Éditeur</SelectItem>
                  <SelectItem value="membre">Membre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Avatar */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatar" className="text-right">
                Avatar
              </Label>
              <Input
                id="avatar"
                name="avatar"
                type="file"
                accept="image/*"
                className="col-span-3"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Aperçu */}
            {avatarPreview && (
              <div className="flex justify-center mt-2">
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="h-24 w-24 rounded-full object-cover border"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Création en cours..." : "Créer l'utilisateur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
