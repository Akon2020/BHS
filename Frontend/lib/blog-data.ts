export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  date: string
  readTime: string
  image?: string
}

const STORAGE_KEY = "burning_heart_posts"

function getInitialPosts(): BlogPost[] {
  return [
    {
      id: "1",
      title: "La puissance de la prière dans la vie quotidienne",
      excerpt: "Découvrez comment la prière peut transformer votre vie quotidienne et vous apporter paix et sérénité.",
      content: "La prière est bien plus qu'un simple acte religieux...",
      category: "Spiritualité",
      author: "Père Ciza",
      date: "10 Mai 2025",
      readTime: "5 min",
    },
    {
      id: "2",
      title: "Comment étudier la Bible efficacement",
      excerpt:
        "Des méthodes pratiques pour tirer le meilleur de votre temps d'étude biblique et approfondir votre compréhension.",
      content: "L'étude de la Bible est essentielle pour tout croyant...",
      category: "Étude Biblique",
      author: "Samuel Diambu",
      date: "2 Mai 2025",
      readTime: "8 min",
    },
    {
      id: "3",
      title: "L'importance de la communauté dans la foi",
      excerpt:
        "Pourquoi la communion fraternelle est essentielle pour une vie de foi épanouissante et comment la cultiver.",
      content: "La communauté chrétienne joue un rôle crucial...",
      category: "Communauté",
      author: "Isaac Akonkwa",
      date: "25 Avril 2025",
      readTime: "6 min",
    },
  ]
}

export function getAllPosts(): BlogPost[] {
  if (typeof window === "undefined") return getInitialPosts()

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    const initial = getInitialPosts()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
    return initial
  }
  return JSON.parse(stored)
}

export function getPostById(id: string): BlogPost | undefined {
  return getAllPosts().find((post) => post.id === id)
}

export function getPostsByCategory(category: string): BlogPost[] {
  if (category === "Tous") return getAllPosts()
  return getAllPosts().filter((post) => post.category === category)
}

export function createPost(post: Omit<BlogPost, "id">): BlogPost {
  const posts = getAllPosts()
  const newPost: BlogPost = {
    ...post,
    id: Date.now().toString(),
  }
  posts.unshift(newPost)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  return newPost
}

export function updatePost(id: string, data: Partial<BlogPost>): BlogPost | null {
  const posts = getAllPosts()
  const index = posts.findIndex((p) => p.id === id)
  if (index === -1) return null

  posts[index] = { ...posts[index], ...data }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  return posts[index]
}

export function deletePost(id: string): boolean {
  const posts = getAllPosts()
  const filtered = posts.filter((p) => p.id !== id)
  if (filtered.length === posts.length) return false

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}
