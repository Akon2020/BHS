"use client";

import { useEffect, useState } from "react";
import {
  getAllBlogs,
  deleteBlog,
} from "@/actions/blog";
import { Blog } from "@/types/user";

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
import { Search, Plus, Eye, Edit, Trash, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface UIBlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  status: "publie" | "brouillon";
  category: string;
  views: number;
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<UIBlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchBlogs = async () => {
    try {
      setLoading(true);

      const data = await getAllBlogs({
        statut: statusFilter !== "all" ? statusFilter : undefined,
      });

      const mapped: UIBlogPost[] = data.blogs.map((blog: Blog) => ({
        id: blog.idBlog,
        title: blog.titre,
        excerpt: blog.extrait || "",
        date: new Date(blog.createdAt).toLocaleDateString(),
        author: blog.auteur?.nomComplet || "—",
        status: blog.statut === "publie" ? "publie" : "brouillon",
        category: blog.categorie?.nomCategorie ?? "—",
        views: blog.nombreVues ?? 0,
      }));

      setPosts(mapped);
      setTotal(mapped.length);
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
    fetchBlogs();
  }, [statusFilter]);

  const handleDelete = async (post: UIBlogPost) => {
    try {
      await deleteBlog(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));

      toast({
        title: "Article supprimé",
        description: post.title,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || post.category === categoryFilter;

    return matchesSearch && matchesCategory;
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
              <SelectItem value="publie">Publié</SelectItem>
              <SelectItem value="brouillon">Brouillon</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {[...new Set(posts.map((p) => p.category))].map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {post.excerpt}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {post.date}
                    </p>
                  </TableCell>

                  <TableCell>{post.author}</TableCell>

                  <TableCell>
                    <Badge variant="outline">{post.category}</Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        post.status === "publie" ? "default" : "outline"
                      }
                    >
                      {post.status === "publie"
                        ? "Publié"
                        : "Brouillon"}
                    </Badge>
                  </TableCell>

                  <TableCell>{post.views}</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/blog/${post.id}/`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/blog/edit/${post.id}/`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(post)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination info */}
      <p className="text-sm text-muted-foreground">
        {filteredPosts.length} sur {total} articles
      </p>
    </div>
  );
}
