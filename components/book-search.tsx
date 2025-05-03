"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BookCard } from "@/components/book-card"
import { useToast } from "@/components/ui/use-toast"
import type { Book } from "@/types/book"
import { searchBooks } from "@/lib/api"

export default function BookSearch() {
  const [query, setQuery] = useState("")
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const results = await searchBooks(query)
      setBooks(results)
      if (results.length === 0) {
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
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for books..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  )
}
