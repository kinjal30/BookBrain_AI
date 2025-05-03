import type { Metadata } from "next"
import BookForm from "@/components/admin/book-form"

export const metadata: Metadata = {
  title: "Add New Book - BookBrain AI",
  description: "Add a new book to the BookBrain AI platform",
}

export default function NewBookPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Book</h1>
      <BookForm />
    </div>
  )
}
