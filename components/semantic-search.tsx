"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BookCard } from "@/components/book-card"
import { useToast } from "@/components/ui/use-toast"
import type { Book } from "@/types/book"
import { Loader2 } from "lucide-react"

export default function SemanticSearch() {
  const [query, setQuery] = useState("")
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/books/semantic-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      setBooks(data.books)

      if (data.books.length === 0) {
        toast({
          title: "No books found",
          description: "Try a different search term",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search books. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Semantic Search</h2>
        <p className="text-muted-foreground mb-4">Search for books by concepts, themes, or similar content</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="E.g., 'dystopian future' or 'coming of age story'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>
      </form>

      {books.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Search Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
