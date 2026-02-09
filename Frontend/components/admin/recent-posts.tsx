import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Blog } from "@/types/user";

interface Props {
  posts?: Blog[] | undefined;
}

const fallbackPosts = [
  {
    id: 1,
    title: "La puissance de la prière dans la vie quotidienne",
    author: "Père Ciza",
    status: "published",
    date: "10 Mai 2025",
  },
  {
    id: 2,
    title: "Comment étudier la Bible efficacement",
    author: "Samuel Diambu",
    status: "published",
    date: "2 Mai 2025",
  },
  {
    id: 3,
    title: "L'importance de la communauté dans la foi",
    author: "Père Ciza",
    status: "draft",
    date: "25 Avril 2025",
  },
  {
    id: 4,
    title: "Témoignage: Comment j'ai trouvé ma vocation",
    author: "Isaac Akonkwa",
    status: "published",
    date: "18 Avril 2025",
  },
  {
    id: 5,
    title: "La louange comme mode de vie",
    author: "Wani Rudendeza",
    status: "draft",
    date: "10 Avril 2025",
  },
];

export default function AdminRecentPosts({ posts }: Props) {
  const list =
    posts && posts.length > 0
      ? posts.map((p) => ({
          id: p.idBlog,
          title: p.titre,
          author: (p as any).auteur?.nomComplet || `ID ${p.idAuteur}`,
          status: p.statut === "publie" ? "published" : "draft",
          date: new Date(p.createdAt).toLocaleDateString(),
        }))
      : fallbackPosts;

  return (
    <div className="space-y-4">
      {list.map((post) => (
        <div key={post.id} className="flex items-center justify-between">
          <div>
            <Link
              href={`/admin/blog/${post.id}`}
              className="font-medium hover:text-primary transition-colors"
            >
              {post.title}
            </Link>
            <p className="text-sm text-muted-foreground">Par {post.author}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={post.status === "published" ? "default" : "outline"}
            >
              {post.status === "published" ? "Publié" : "Brouillon"}
            </Badge>
            <span className="text-xs text-muted-foreground">{post.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
