"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Book } from "@/types/book"
import { indexBook } from "@/lib/api"

interface BookFormProps {
  book?: Book
  isEditing?: boolean
}

export default function BookForm({ book, isEditing = false }: BookFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState<Partial<Book>>({
    title: book?.title || "",
    author: book?.author || "",
    year: book?.year || new Date().getFullYear(),
    genre: book?.genre || "",
    description: book?.description || "",
    coverImage: book?.coverImage || "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" ? Number.parseInt(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In a real app, this would call your API to save the book
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create a book object with an ID
      const bookWithId = {
        id: book?.id || `new-${Date.now()}`,
        ...(formData as Book),
      }

      // Index the book in Redis
      await indexBook(bookWithId)

      toast({
        title: isEditing ? "Book updated" : "Book added",
        description: `"${formData.title}" has been ${isEditing ? "updated" : "added"} successfully.`,
      })

      router.push("/admin")
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "add"} book. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input id="author" name="author" value={formData.author} onChange={handleChange} required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input id="year" name="year" type="number" value={formData.year} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Input id="genre" name="genre" value={formData.genre} onChange={handleChange} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverImage">Cover Image URL</Label>
          <Input
            id="coverImage"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleChange}
            placeholder="https://example.com/book-cover.jpg"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? (isEditing ? "Updating..." : "Adding...") : isEditing ? "Update Book" : "Add Book"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
