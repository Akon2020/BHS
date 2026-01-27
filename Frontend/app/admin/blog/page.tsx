"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye, Edit, Trash } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Exemple de données d'articles
const blogPosts = [
  {
    id: 1,
    title: "La puissance de la prière dans la vie quotidienne",
    excerpt:
      "Découvrez comment la prière peut transformer votre vie quotidienne et vous apporter paix et sérénité.",
    date: "10 Mai 2025",
    author: "Père Michel",
    status: "published",
    category: "Spiritualité",
    views: 1245,
  },
  {
    id: 2,
    title: "Comment étudier la Bible efficacement",
    excerpt:
      "Des méthodes pratiques pour tirer le meilleur de votre temps d'étude biblique et approfondir votre compréhension.",
    date: "2 Mai 2025",
    author: "Sarah Dubois",
    status: "published",
    category: "Étude Biblique",
    views: 876,
  },
  {
    id: 3,
    title: "L'importance de la communauté dans la foi",
    excerpt:
      "Pourquoi la communion fraternelle est essentielle pour une vie de foi épanouissante et comment la cultiver.",
    date: "25 Avril 2025",
    author: "Père Michel",
    status: "draft",
    category: "Communauté",
    views: 0,
  },
  {
    id: 4,
    title: "Témoignage: Comment j'ai trouvé ma vocation",
    excerpt:
      "L'histoire inspirante de Jean qui a découvert son appel à travers les épreuves et les bénédictions.",
    date: "18 Avril 2025",
    author: "Jean Martin",
    status: "published",
    category: "Témoignages",
    views: 543,
  },
  {
    id: 5,
    title: "La louange comme mode de vie",
    excerpt:
      "Comment intégrer la louange dans tous les aspects de votre vie quotidienne, au-delà du dimanche matin.",
    date: "10 Avril 2025",
    author: "Marie Leclerc",
    status: "draft",
    category: "Louange",
    views: 0,
  },
  {
    id: 6,
    title: "Élever des enfants dans la foi aujourd'hui",
    excerpt:
      "Conseils pratiques pour les parents qui souhaitent transmettre leur foi à leurs enfants dans un monde moderne.",
    date: "2 Avril 2025",
    author: "Sophie et Thomas",
    status: "published",
    category: "Famille",
    views: 921,
  },
];

// Catégories pour le filtre
const categories = [
  "Tous",
  "Spiritualité",
  "Étude Biblique",
  "Communauté",
  "Témoignages",
  "Louange",
  "Famille",
];

export default function BlogAdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Filtrer les articles en fonction de la recherche et des filtres
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && post.status === "published") ||
      (statusFilter === "draft" && post.status === "draft");

    const matchesCategory =
      categoryFilter === "all" || post.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion du Blog</h1>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel article
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un article..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="published">Publié</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories
                .filter((c) => c !== "Tous")
                .map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Blog Posts Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Article</TableHead>
              <TableHead>Auteur</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Vues</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {post.excerpt}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {post.date}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell>
                  <Badge variant="outline">{post.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      post.status === "published" ? "default" : "outline"
                    }
                  >
                    {post.status === "published" ? "Publié" : "Brouillon"}
                  </Badge>
                </TableCell>
                <TableCell>{post.views}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/blog/${post.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/blog/${post.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Affichage de <strong>1</strong> à{" "}
          <strong>{filteredPosts.length}</strong> sur{" "}
          <strong>{blogPosts.length}</strong> articles
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Précédent
          </Button>
          <Button variant="outline" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm">
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
