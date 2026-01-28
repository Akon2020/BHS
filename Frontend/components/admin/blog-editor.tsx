"use client"

import { useState, useEffect, useCallback, memo } from "react"
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
  AlertCircle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BlogEditorProps {
  initialContent?: string
  onChange: (content: string) => void
  disabled?: boolean
}

function BlogEditor({ initialContent = "", onChange, disabled = false }: BlogEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Mettre à jour le contenu local quand initialContent change
  useEffect(() => {
    if (isMounted) {
      setContent(initialContent)
    }
  }, [initialContent, isMounted])

  // Notifier le parent quand le contenu change
  useEffect(() => {
    if (isMounted) {
      onChange(content)
    }
  }, [content, onChange, isMounted])

  const insertTag = useCallback((openTag: string, closeTag: string) => {
    if (!isMounted || disabled) return

    const textarea = document.getElementById("blog-editor-textarea") as HTMLTextAreaElement
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
      const newCursorPos = start + openTag.length
      textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length)
    }, 10)
  }, [content, disabled, isMounted])

  const handleButtonClick = useCallback((type: string) => {
    if (disabled) return

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
        insertTag("<ul>\n<li>", "</li>\n</ul>")
        break
      case "ol":
        insertTag("<ol>\n<li>", "</li>\n</ol>")
        break
      case "link":
        insertTag('<a href="https://example.com" title="">', "</a>")
        break
      case "image":
        insertTag('<img src="/placeholder.jpg" alt="Description de l\'image" title="" />', "")
        break
      case "quote":
        insertTag('<blockquote>\n<p>', "</p>\n</blockquote>")
        break
      case "code":
        insertTag('<pre><code class="language-html">', "</code></pre>")
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
  }, [insertTag, disabled])

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled) return
    setContent(e.target.value)
  }, [disabled])

  const toolbarButtons = [
    { type: "bold", icon: Bold, label: "Gras (Ctrl+B)", shortcut: "Ctrl+B" },
    { type: "italic", icon: Italic, label: "Italique (Ctrl+I)", shortcut: "Ctrl+I" },
    { type: "underline", icon: Underline, label: "Souligné (Ctrl+U)", shortcut: "Ctrl+U" },
    { type: "h1", icon: Heading1, label: "Titre 1" },
    { type: "h2", icon: Heading2, label: "Titre 2" },
    { type: "h3", icon: Heading3, label: "Titre 3" },
    { type: "ul", icon: List, label: "Liste à puces" },
    { type: "ol", icon: ListOrdered, label: "Liste numérotée" },
    { type: "link", icon: LinkIcon, label: "Lien" },
    { type: "image", icon: ImageIcon, label: "Image" },
    { type: "quote", icon: Quote, label: "Citation" },
    { type: "code", icon: Code, label: "Code" },
  ]

  // Gestion des raccourcis clavier
  useEffect(() => {
    if (!isMounted || disabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault()
            handleButtonClick("bold")
            break
          case "i":
            e.preventDefault()
            handleButtonClick("italic")
            break
          case "u":
            e.preventDefault()
            handleButtonClick("underline")
            break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleButtonClick, disabled, isMounted])

  if (!isMounted) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1 p-1 border rounded-md bg-secondary/20 min-h-[44px]" />
        <Textarea
          placeholder="Chargement de l'éditeur..."
          className="min-h-[400px] font-mono text-sm opacity-50"
          disabled
        />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Barre d'outils */}
        <div className="flex flex-wrap gap-1 p-1 border rounded-md bg-secondary/20">
          {toolbarButtons.map((button) => {
            const Icon = button.icon
            return (
              <Tooltip key={button.type}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleButtonClick(button.type)}
                    title={button.label}
                    disabled={disabled}
                    className="h-8 w-8"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{button.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{button.label}</p>
                  {button.shortcut && (
                    <p className="text-xs text-muted-foreground">{button.shortcut}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        {/* Zone de texte */}
        <div className="relative">
          <Textarea
            id="blog-editor-textarea"
            value={content}
            onChange={handleTextareaChange}
            placeholder="Commencez à écrire votre article ici... Utilisez du HTML ou les boutons ci-dessus pour formater votre texte."
            className="min-h-[400px] font-mono text-sm resize-y"
            disabled={disabled}
            aria-label="Éditeur de contenu d'article"
          />
          
          {/* Compteur de caractères */}
          <div className="absolute bottom-2 right-2">
            <div className="text-xs bg-background/80 backdrop-blur-sm px-2 py-1 rounded border">
              {content.length} caractères
            </div>
          </div>
        </div>

        {/* Conseils */}
        <div className="rounded-lg border bg-muted/50 p-3">
          <div className="flex items-start gap-2 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Conseils d'édition</p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>Utilisez les boutons pour insérer du HTML formaté</li>
                <li>Les raccourcis clavier (Ctrl+B, Ctrl+I, Ctrl+U) sont disponibles</li>
                <li>Pensez à utiliser des titres (H1, H2, H3) pour structurer votre contenu</li>
                <li>L'aperçu montre comment le contenu sera affiché sur le site</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default memo(BlogEditor)