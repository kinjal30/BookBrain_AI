"use server"

import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { generateBookEmbedding } from "@/lib/embeddings"
import { saveBookEmbedding } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const book = await req.json()
    if (!book || !book.id || !book.title || !book.author) {
      return NextResponse.json({ error: "Invalid book data" }, { status: 400 })
    }

    // Generate embedding
    const embedding = await generateBookEmbedding({
      title: book.title,
      author: book.author,
      description: book.description,
    })

    // Save embedding
    const success = await saveBookEmbedding(Number.parseInt(book.id), embedding)

    return NextResponse.json({ success })
  } catch (error) {
    console.error("Error indexing book:", error)
    return NextResponse.json({ error: "Failed to index book" }, { status: 500 })
  }
}
