"use server"

import { type NextRequest, NextResponse } from "next/server"
import { getUserLibrary, getAllBooks } from "@/lib/db"
import { generateBookEmbedding } from "@/lib/embeddings"
import { getCurrentUser } from "@/lib/auth"

// Simple implementation of cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must be of same length")
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(user.id)
    const userBooks = await getUserLibrary(userId)
    const allBooks = await getAllBooks()

    // If user has no books, return random recommendations
    if (userBooks.length === 0) {
      const randomBooks = allBooks
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .filter((book) => !userBooks.some((userBook) => userBook.id === book.id))

      return NextResponse.json({ books: randomBooks })
    }

    // Generate a combined embedding for all user books
    const userBooksText = userBooks
      .map((book) => `${book.title} by ${book.author}. ${book.description || ""}`)
      .join(" ")
    const userEmbedding = await generateBookEmbedding({ title: "User Library", author: "", description: userBooksText })

    // Calculate similarity for each book not in user's library
    const booksWithSimilarity = await Promise.all(
      allBooks
        .filter((book) => !userBooks.some((userBook) => userBook.id === book.id))
        .map(async (book) => {
          const bookEmbedding = await generateBookEmbedding({
            title: book.title,
            author: book.author,
            description: book.description,
          })
          const similarity = cosineSimilarity(userEmbedding, bookEmbedding)
          return { book, similarity }
        }),
    )

    // Sort by similarity and take top 5
    const recommendations = booksWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map((item) => item.book)

    return NextResponse.json({ books: recommendations })
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
