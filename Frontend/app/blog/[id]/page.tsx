import { notFound } from "next/navigation"
import { User, Calendar, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getPostById, getAllPosts } from "@/lib/blog-data"
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    id: post.id,
  }))
}

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const post = getPostById(params.id)

  if (!post) {
    notFound()
  }

  return (
    <div className="flex flex-col">
      <Header />
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au blog
            </Button>
          </Link>

          <div className="mt-8">
            <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {post.category}
            </div>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl">{post.title}</h1>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 aspect-video overflow-hidden rounded-xl bg-muted">
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <span className="text-9xl opacity-10">✝</span>
            </div>
          </div>

          <div className="prose prose-lg mt-12 max-w-none dark:prose-invert">
            <p className="lead text-xl text-muted-foreground leading-relaxed">{post.excerpt}</p>

            <div className="mt-8 space-y-6 text-pretty leading-relaxed">
              <p>{post.content}</p>

              <h2>Une invitation à la transformation</h2>
              <p>
                La spiritualité chrétienne nous invite à une transformation profonde de notre être. Ce n'est pas
                seulement une question de pratiques religieuses, mais d'une relation vivante avec Dieu qui change notre
                perspective sur la vie.
              </p>

              <h2>Les fondements bibliques</h2>
              <p>
                L'Écriture nous enseigne que la foi sans les œuvres est morte. Notre engagement spirituel doit se
                manifester dans nos actions quotidiennes, dans la manière dont nous traitons les autres et dans notre
                quête de justice et de paix.
              </p>

              <h2>Application pratique</h2>
              <p>
                Pour intégrer ces enseignements dans votre vie quotidienne, commencez par des petits pas. Consacrez
                quelques minutes chaque jour à la méditation biblique, priez régulièrement et cherchez des occasions de
                servir votre communauté.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-xl bg-muted/50 p-8">
            <h3 className="font-serif text-2xl font-bold">Partagez votre expérience</h3>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              Cet article vous a inspiré? N'hésitez pas à le partager avec votre entourage et à nous faire part de vos
              réflexions.
            </p>
            <div className="mt-6">
              <Link href="/contact">
                <Button>Nous contacter</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
