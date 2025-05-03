"use server"

import { revalidatePath } from "next/cache"
import {
  createBook,
  updateBook,
  deleteBook,
  addBookToUserLibrary,
  removeBookFromUserLibrary,
  saveBookSummary,
  saveBookFile,
} from "@/lib/db"
import { generateBookEmbedding } from "@/lib/embeddings"
import { saveBookEmbedding } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function addBook(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || !user.isAdmin) {
    return { error: "Unauthorized" }
  }

  const title = formData.get("title") as string
  const author = formData.get("author") as string
  const yearStr = formData.get("year") as string
  const genre = formData.get("genre") as string
  const description = formData.get("description") as string
  const coverImage = formData.get("coverImage") as string

  // Validate input
  if (!title || !author || !yearStr || !genre) {
    return { error: "Title, author, year, and genre are required" }
  }

  const year = Number.parseInt(yearStr)
  if (isNaN(year)) {
    return { error: "Year must be a number" }
  }

  try {
    const book = await createBook({
      title,
      author,
      year,
      genre,
      description: description || undefined,
      coverImage: coverImage || undefined,
    })

    if (!book) {
      return { error: "Failed to create book" }
    }

    // Generate and save embedding
    const embedding = await generateBookEmbedding({
      title,
      author,
      description: description || undefined,
    })
    await saveBookEmbedding(Number.parseInt(book.id), embedding)

    revalidatePath("/admin")
    revalidatePath("/books")
    return { success: true, book }
  } catch (error) {
    console.error("Error adding book:", error)
    return { error: "An error occurred while adding the book" }
  }
}

export async function updateBookAction(id: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user || !user.isAdmin) {
    return { error: "Unauthorized" }
  }

  const title = formData.get("title") as string
  const author = formData.get("author") as string
  const yearStr = formData.get("year") as string
  const genre = formData.get("genre") as string
  const description = formData.get("description") as string
  const coverImage = formData.get("coverImage") as string

  // Validate input
  if (!title || !author || !yearStr || !genre) {
    return { error: "Title, author, year, and genre are required" }
  }

  const year = Number.parseInt(yearStr)
  if (isNaN(year)) {
    return { error: "Year must be a number" }
  }

  try {
    const book = await updateBook(Number.parseInt(id), {
      title,
      author,
      year,
      genre,
      description: description || undefined,
      coverImage: coverImage || undefined,
    })

    if (!book) {
      return { error: "Failed to update book" }
    }

    // Update embedding
    const embedding = await generateBookEmbedding({
      title,
      author,
      description: description || undefined,
    })
    await saveBookEmbedding(Number.parseInt(book.id), embedding)

    revalidatePath(`/admin/books/edit/${id}`)
    revalidatePath(`/books/${id}`)
    revalidatePath("/admin")
    revalidatePath("/books")
    return { success: true, book }
  } catch (error) {
    console.error("Error updating book:", error)
    return { error: "An error occurred while updating the book" }
  }
}

export async function deleteBookAction(id: string) {
  const user = await getCurrentUser()
  if (!user || !user.isAdmin) {
    return { error: "Unauthorized" }
  }

  try {
    const success = await deleteBook(Number.parseInt(id))
    if (!success) {
      return { error: "Failed to delete book" }
    }

    revalidatePath("/admin")
    revalidatePath("/books")
    return { success: true }
  } catch (error) {
    console.error("Error deleting book:", error)
    return { error: "An error occurred while deleting the book" }
  }
}

export async function addToLibrary(bookId: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  try {
    const success = await addBookToUserLibrary(Number.parseInt(user.id), Number.parseInt(bookId))
    if (!success) {
      return { error: "Failed to add book to library" }
    }

    revalidatePath("/dashboard")
    revalidatePath(`/books/${bookId}`)
    return { success: true }
  } catch (error) {
    console.error("Error adding book to library:", error)
    return { error: "An error occurred while adding the book to your library" }
  }
}

export async function removeFromLibrary(bookId: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  try {
    const success = await removeBookFromUserLibrary(Number.parseInt(user.id), Number.parseInt(bookId))
    if (!success) {
      return { error: "Failed to remove book from library" }
    }

    revalidatePath("/dashboard")
    revalidatePath(`/books/${bookId}`)
    return { success: true }
  } catch (error) {
    console.error("Error removing book from library:", error)
    return { error: "An error occurred while removing the book from your library" }
  }
}

export async function saveBookSummaryAction(bookId: string, summary: string) {
  const user = await getCurrentUser()
  if (!user || !user.isAdmin) {
    return { error: "Unauthorized" }
  }

  try {
    const success = await saveBookSummary(Number.parseInt(bookId), summary)
    if (!success) {
      return { error: "Failed to save book summary" }
    }

    revalidatePath(`/books/${bookId}`)
    return { success: true }
  } catch (error) {
    console.error("Error saving book summary:", error)
    return { error: "An error occurred while saving the book summary" }
  }
}

export async function saveBookFileAction(bookId: string, filePath: string, fileSize: number) {
  const user = await getCurrentUser()
  if (!user || !user.isAdmin) {
    return { error: "Unauthorized" }
  }

  try {
    const success = await saveBookFile(Number.parseInt(bookId), filePath, fileSize)
    if (!success) {
      return { error: "Failed to save book file" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error saving book file:", error)
    return { error: "An error occurred while saving the book file" }
  }
}
