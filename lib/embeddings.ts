import { generateBookEmbedding as generateBookEmbeddingUtil } from "@/lib/ai-utils"

// Re-export the function from ai-utils
export const generateEmbedding = async (text: string) => {
  // Import from ai-utils to avoid duplication
  const { generateEmbedding } = await import("@/lib/ai-utils")
  return generateEmbedding(text)
}

// Re-export the book embedding function
export const generateBookEmbedding = generateBookEmbeddingUtil
