"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { updateUser } from "@/actions/users";

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
}

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSuccess?: () => void
}

export default function EditUserModal({ isOpen, onClose, user, onSuccess }: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
    resetPassword: false,
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        resetPassword: false,
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setUserData((prev) => ({ ...prev, [name]: value }))
  }


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
      const response = await updateUser({
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

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>Modifiez les informations de l'utilisateur ci-dessous.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rôle
              </Label>
              <Select value={userData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="editor">Éditeur</SelectItem>
                  <SelectItem value="member">Membre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Statut
              </Label>
              <Select value={userData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
