import { Redis } from "@upstash/redis"

// Initialize Redis client with the correct URL format
export const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
})

// Check if Redis is connected
export async function pingRedis() {
  try {
    const pong = await redis.ping()
    return pong === "PONG"
  } catch (error) {
    console.error("Redis connection error:", error)
    return false
  }
}

// Store book embedding
export async function storeBookEmbedding(bookId: string, embedding: number[]) {
  try {
    // Store the embedding as a JSON string
    await redis.hset(`book:${bookId}`, { embedding: JSON.stringify(embedding) })
    // Add to book index
    await redis.sadd("book:index", bookId)
    return true
  } catch (error) {
    console.error("Error storing book embedding:", error)
    return false
  }
}

// Get book embedding
export async function getBookEmbedding(bookId: string): Promise<number[] | null> {
  try {
    const embeddingStr = await redis.hget(`book:${bookId}`, "embedding")
    if (!embeddingStr) return null
    return JSON.parse(embeddingStr as string)
  } catch (error) {
    console.error("Error getting book embedding:", error)
    return null
  }
}

// Delete book embedding
export async function deleteBookEmbedding(bookId: string) {
  try {
    await redis.del(`book:${bookId}`)
    await redis.srem("book:index", bookId)
    return true
  } catch (error) {
    console.error("Error deleting book embedding:", error)
    return false
  }
}

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

// Find similar books based on embedding
export async function findSimilarBooks(embedding: number[], limit = 5): Promise<string[]> {
  try {
    // Get all book IDs
    const bookIds = (await redis.smembers("book:index")) as string[]

    // Calculate similarity for each book
    const similarities: { bookId: string; similarity: number }[] = []

    for (const bookId of bookIds) {
      const bookEmbedding = await getBookEmbedding(bookId)
      if (bookEmbedding) {
        const similarity = cosineSimilarity(embedding, bookEmbedding)
        similarities.push({ bookId, similarity })
      }
    }

    // Sort by similarity (descending) and take top N
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((item) => item.bookId)
  } catch (error) {
    console.error("Error finding similar books:", error)
    return []
  }
}

// Store book metadata in Redis
export async function storeBookMetadata(bookId: string, metadata: Record<string, any>) {
  try {
    await redis.hset(`book:${bookId}:metadata`, metadata)
    return true
  } catch (error) {
    console.error("Error storing book metadata:", error)
    return false
  }
}

// Get book metadata from Redis
export async function getBookMetadata(bookId: string): Promise<Record<string, any> | null> {
  try {
    const metadata = await redis.hgetall(`book:${bookId}:metadata`)
    return metadata || null
  } catch (error) {
    console.error("Error getting book metadata:", error)
    return null
  }
}

// Get all book IDs
export async function getAllBookIds(): Promise<string[]> {
  try {
    return (await redis.smembers("book:index")) as string[]
  } catch (error) {
    console.error("Error getting all book IDs:", error)
    return []
  }
}
