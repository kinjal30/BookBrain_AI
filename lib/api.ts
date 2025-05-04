import type { Book } from "@/types/book"

export async function searchBooks(query: string): Promise<Book[]> {
  try {
    const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error("Failed to search books")
    }
    const data = await response.json()
    return data.books
  } catch (error) {
    console.error("Error searching books:", error)
    return []
  }
}

export async function getBookSummary(bookId: string): Promise<string> {
  try {
    console.log(`API client: Fetching summary for book ${bookId}`)
    const response = await fetch(`/api/books/${bookId}/summary`)
    if (!response.ok) {
      console.error(`API client: Error fetching summary, status: ${response.status}`)
      throw new Error("Failed to get summary")
    }
    const data = await response.json()
    console.log(`API client: Successfully fetched summary for book ${bookId}`)
    return data.summary
  } catch (error) {
    console.error("API client: Error getting book summary:", error)
    throw error
  }
}

export async function getAllBooks(): Promise<Book[]> {
  try {
    const response = await fetch("/api/books")
    if (!response.ok) {
      throw new Error("Failed to get books")
    }
    const data = await response.json()
    return data.books
  } catch (error) {
    console.error("Error getting all books:", error)
    return []
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  try {
    const response = await fetch(`/api/books/${id}`)
    if (!response.ok) {
      throw new Error("Failed to get book")
    }
    const data = await response.json()
    return data.book
  } catch (error) {
    console.error("Error getting book by ID:", error)
    return null
  }
}

export async function indexBook(book: Book): Promise<boolean> {
  try {
    const response = await fetch("/api/books/index", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(book),
    })
    if (!response.ok) {
      throw new Error("Failed to index book")
    }
    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error indexing book:", error)
    return false
  }
}

export async function removeBookFromIndex(bookId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/books/index/${bookId}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Failed to remove book from index")
    }
    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error removing book from index:", error)
    return false
  }
}
