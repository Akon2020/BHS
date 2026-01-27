"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react"

interface BlogEditorProps {
  initialContent?: string
  onChange: (content: string) => void
}

export default function BlogEditor({ initialContent = "", onChange }: BlogEditorProps) {
  const [content, setContent] = useState(initialContent)

  useEffect(() => {
    onChange(content)
  }, [content, onChange])

  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = document.getElementById("editor") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const beforeText = content.substring(0, start)
    const afterText = content.substring(end)

    const newContent = beforeText + openTag + selectedText + closeTag + afterText
    setContent(newContent)

    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + selectedText.length)
    }, 0)
  }

  const handleButtonClick = (type: string) => {
    switch (type) {
      case "bold":
        insertTag("<strong>", "</strong>")
        break
      case "italic":
        insertTag("<em>", "</em>")
        break
      case "underline":
        insertTag("<u>", "</u>")
        break
      case "ul":
        insertTag("<ul>\n  <li>", "</li>\n</ul>")
        break
      case "ol":
        insertTag("<ol>\n  <li>", "</li>\n</ol>")
        break
      case "link":
        insertTag('<a href="https://example.com">', "</a>")
        break
      case "image":
        insertTag('<img src="/placeholder.svg" alt="', '" />')
        break
      case "quote":
        insertTag("<blockquote>", "</blockquote>")
        break
      case "code":
        insertTag("<pre><code>", "</code></pre>")
        break
      case "h1":
        insertTag("<h1>", "</h1>")
        break
      case "h2":
        insertTag("<h2>", "</h2>")
        break
      case "h3":
        insertTag("<h3>", "</h3>")
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 p-1 border rounded-md bg-secondary/20">
        <Button variant="ghost" size="icon" onClick={() => handleButtonClick("bold")} title="Gras">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleButtonClick("italic")} title="Italique">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleButtonClick("underline")} title="Souligné">
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1 my-auto" />
        <Button variant="ghost" size="icon" onClick={() => handleButtonClick("h1")} title="Titre 1">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleButtonClick("h2")} title="Titre 2">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleButtonClick("h3")} title="Titre 3">
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1 my-auto" />
        <Button variant="ghost" size="icon" onClick={() => handleButtonClick("ul")} title="Liste à puces">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleButtonClick("ol")} title="Liste numérotée">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1 my-auto" />
        <Button variant="ghost" size="icon" onClick={() => handleButtonClick("link")} title="Lien">
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleButtonClick("image")} title="Image">
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleButtonClick("quote")} title="Citation">
          <Quote className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleButtonClick("code")} title="Code">
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <Textarea
        id="editor"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Commencez à écrire votre article ici..."
        className="min-h-[400px] font-mono text-sm"
      />
    </div>
  )
}
