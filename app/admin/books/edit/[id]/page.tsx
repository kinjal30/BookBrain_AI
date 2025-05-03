"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import BookForm from "@/components/admin/book-form"
import type { Book } from "@/types/book"
import { getBookById } from "@/lib/api"

export default function EditBookPage() {
  const params = useParams()
  const bookId = params.id as string
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookData = await getBookById(bookId)
        setBook(bookData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load book details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [bookId, toast])

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading book details...</div>
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Book Not Found</h1>
        <p>The book you are trying to edit does not exist.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Book: {book.title}</h1>
      <BookForm book={book} isEditing />
    </div>
  )
}
