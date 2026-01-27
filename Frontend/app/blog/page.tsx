"use client"

import { useState } from "react"
import Link from "next/link"
import { User, Calendar, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getPostsByCategory } from "@/lib/blog-data"
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const categories = ["Tous", "Spiritualité", "Étude Biblique", "Communauté", "Témoignages", "Louange", "Famille"]

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Tous")
  const posts = getPostsByCategory(activeCategory)

  return (
    <div className="flex flex-col">
      <Header />
      {/* Hero */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">Notre Blog</h1>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              Découvrez des articles inspirants, des enseignements profonds et des témoignages qui nourriront votre foi
              et votre vie spirituelle.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b bg-background py-6">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <Card className="group h-full border-none bg-card shadow-sm transition-shadow hover:shadow-md">
                  <div className="aspect-video overflow-hidden rounded-t-lg bg-muted">
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <span className="text-6xl opacity-10">✝</span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {post.category}
                    </div>
                    <h3 className="mt-4 font-serif text-xl font-bold leading-snug group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
