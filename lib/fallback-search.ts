import { getAllBooks } from "@/lib/db"
import type { Book } from "@/types/book"

// Fallback implementation for semantic search when Redis is not available
export async function fallbackSemanticSearch(query: string, limit = 5): Promise<Book[]> {
  try {
    // Get all books
    const allBooks = await getAllBooks()

    // Simple keyword matching (not truly semantic, but a fallback)
    const queryTerms = query.toLowerCase().split(/\s+/)

    // Score each book based on how many query terms appear in the title, author, or description
    const scoredBooks = allBooks.map((book) => {
      const bookText = `${book.title} ${book.author} ${book.description || ""}`.toLowerCase()
      const score = queryTerms.reduce((count, term) => {
        return count + (bookText.includes(term) ? 1 : 0)
      }, 0)

      return { book, score }
    })

    // Sort by score (descending) and take top N
    return scoredBooks
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.book)
  } catch (error) {
    console.error("Error in fallback semantic search:", error)
    return []
  }
}
