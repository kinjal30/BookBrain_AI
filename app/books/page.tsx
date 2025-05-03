import type { Metadata } from "next"
import BookList from "@/components/book-list"

export const metadata: Metadata = {
  title: "All Books - BookBrain AI",
  description: "Browse all books in the BookBrain AI platform",
}

export default function BooksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Books</h1>
      <BookList />
    </div>
  )
}
