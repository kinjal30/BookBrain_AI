import { type NextRequest, NextResponse } from "next/server"
import { generateEmbedding } from "@/lib/embeddings"
import { findSimilarBooks } from "@/lib/redis"
import { getBookById } from "@/lib/api"
import { fallbackSemanticSearch } from "@/lib/fallback-search"
import { pingRedis } from "@/lib/redis"

export async function POST(req: NextRequest) {
  try {
    const { query, limit = 5 } = await req.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Check if Redis is available
    const redisAvailable = await pingRedis().catch(() => false)

    let books: any[] = []

    if (redisAvailable) {
      // Use Redis for semantic search
      try {
        // Generate embedding for the query
        const embedding = await generateEmbedding(query)

        // Find similar books
        const similarBookIds = await findSimilarBooks(embedding, limit)

        // Get book details
        books = await Promise.all(
          similarBookIds.map(async (id) => {
            const book = await getBookById(id)
            return book
          }),
        )

        // Filter out null values
        books = books.filter((book) => book !== null)
      } catch (error) {
        console.error("Error in Redis semantic search:", error)
        // Fall back to keyword search
        books = await fallbackSemanticSearch(query, limit)
      }
    } else {
      // Use fallback search
      books = await fallbackSemanticSearch(query, limit)
    }

    return NextResponse.json({ books })
  } catch (error) {
    console.error("Error in semantic search:", error)
    return NextResponse.json({ error: "Failed to perform semantic search" }, { status: 500 })
  }
}
