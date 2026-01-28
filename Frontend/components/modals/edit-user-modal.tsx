"use client";

import { useEffect, useState } from "react";
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
import { updateUser } from "@/actions/users";

interface UserUI {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserUI | null;
  onSuccess?: () => void;
}

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    nomComplet: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        nomComplet: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("nomComplet", form.nomComplet);
      formData.append("email", form.email);
      formData.append("role", form.role);
      if (avatarFile) formData.append("avatar", avatarFile);

      await updateUser(user.id, formData);

      toast({
        title: "Utilisateur mis à jour",
      });

      onClose();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
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
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de l'utilisateur.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label className="text-right">Nom</Label>
              <Input
                value={form.nomComplet}
                onChange={(e) =>
                  setForm({ ...form, nomComplet: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 gap-4 items-center">
              <Label className="text-right">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 gap-4 items-center">
              <Label className="text-right">Rôle</Label>
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm({ ...form, role: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="editeur">Éditeur</SelectItem>
                  <SelectItem value="membre">Membre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 gap-4 items-center">
              <Label className="text-right">Avatar</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setAvatarFile(e.target.files?.[0] || null)
                }
                className="col-span-3"
              />
            </div>

            {avatarPreview && (
              <div className="flex justify-center">
                <img
                  src={avatarPreview}
                  className="h-20 w-20 rounded-full object-cover"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
