"use client"

import { useState, useEffect } from "react"
import { BookCard } from "@/components/book-card"
import type { Book } from "@/types/book"
import { getAllBooks } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function BookList() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const allBooks = await getAllBooks()
        setBooks(allBooks)
        setError(null)
      } catch (error) {
        console.error("Error fetching books:", error)
        setError("Failed to load books. The database might not be set up yet.")
        toast({
          title: "Error",
          description: "Failed to load books. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [toast])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading books...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <p className="mb-4">If you're an admin, you can add books from the admin dashboard.</p>
        <div className="flex justify-center gap-4">
          <Link href="/admin">
            <Button variant="outline">Go to Admin Dashboard</Button>
          </Link>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No books found in the library yet.</p>
        <p className="mb-4">If you're an admin, you can add books from the admin dashboard.</p>
        <Link href="/admin">
          <Button variant="outline">Go to Admin Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}
