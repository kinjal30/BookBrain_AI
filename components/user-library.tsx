"use client"

import { useState } from "react"
import Link from "next/link"
import type { Book } from "@/types/book"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { removeFromLibrary } from "@/app/actions/books"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, BookOpen, Trash } from "lucide-react"

interface UserLibraryProps {
  initialBooks: Book[]
}

export default function UserLibrary({ initialBooks }: UserLibraryProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const handleRemoveBook = async (bookId: string) => {
    setLoading(bookId)
    try {
      const result = await removeFromLibrary(bookId)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setBooks(books.filter((book) => book.id !== bookId))
        toast({
          title: "Book removed",
          description: "The book has been removed from your library",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove book from library",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Library</CardTitle>
        <CardDescription>Books you've added to your personal library</CardDescription>
      </CardHeader>
      <CardContent>
        {books.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Your library is empty</p>
            <Link href="/books">
              <Button>Browse Books</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <div key={book.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-16 bg-muted rounded overflow-hidden">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage || "/placeholder.svg"}
                        alt={`Cover of ${book.title}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <BookOpen size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <Link href={`/books/${book.id}`} className="font-medium hover:underline">
                      {book.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/books/${book.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveBook(book.id)}
                    disabled={loading === book.id}
                  >
                    {loading === book.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
