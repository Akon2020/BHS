"use client";

import { useEffect, useState } from "react";
import {
  getAllCategories,
  createCategorie,
  updateCategorie,
  deleteCategorie,
} from "@/actions/categorie";
import { Categorie } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash, Loader2 } from "lucide-react";
import DeleteCategorieModal from "@/components/modals/delete-categorie-modal";

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [editing, setEditing] = useState<Categorie | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Categorie | null>(
    null,
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await getAllCategories();
      setCategories(res.categories);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!newCategory.trim()) return;

    setIsSaving(true);
    try {
      await createCategorie(newCategory);
      toast({ title: "Catégorie créée" });
      setNewCategory("");
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;

    setIsSaving(true);
    try {
      await updateCategorie(editing.idCategorie, editing.nomCategorie);
      toast({ title: "Catégorie mise à jour" });
      setEditing(null);
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;

    await deleteCategorie(selectedCategory.idCategorie);
    toast({ title: "Catégorie supprimée" });
    setCategories((prev) =>
      prev.filter((c) => c.idCategorie !== selectedCategory.idCategorie),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Catégories de blog</h1>
      </div>

      {/* Create */}
      <div className="flex gap-2 max-w-md">
        <Input
          placeholder="Nouvelle catégorie"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <Button onClick={handleCreate} disabled={isSaving}>
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  <Loader2 className="animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.idCategorie}>
                  <TableCell>
                    {editing?.idCategorie === cat.idCategorie ? (
                      <Input
                        value={editing.nomCategorie}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            nomCategorie: e.target.value,
                          })
                        }
                      />
                    ) : (
                      cat.nomCategorie
                    )}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {cat.slug}
                  </TableCell>

                  <TableCell>
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="flex gap-2">
                    {editing?.idCategorie === cat.idCategorie ? (
                      <Button
                        size="sm"
                        onClick={handleUpdate}
                        disabled={isSaving}
                      >
                        Sauvegarder
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing(cat)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete modal */}
      <DeleteCategorieModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Supprimer la catégorie"
        description={`Êtes-vous sûr de vouloir supprimer la catégorie "${selectedCategory?.nomCategorie}" ? Cette action est irréversible.`}
      />
    </div>
  );
}
