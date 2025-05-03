"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Book } from "@/types/book"
import { getAllBooks, removeBookFromIndex } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminBookList() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const allBooks = await getAllBooks()
        setBooks(allBooks)
      } catch (error) {
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

  const handleEdit = (id: string) => {
    router.push(`/admin/books/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      // Remove from Redis index
      await removeBookFromIndex(id)

      // In a real app, this would call your API to delete the book
      toast({
        title: "Book deleted",
        description: "The book has been removed successfully",
      })

      // Update the books list
      setBooks(books.filter((book) => book.id !== id))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete book. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading books...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Book Management</h2>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No books found. Add your first book to get started.
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.year}</TableCell>
                  <TableCell>{book.genre}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(book.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(book.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
