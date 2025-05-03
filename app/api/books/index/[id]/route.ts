"use server"

import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { deleteBookEmbedding } from "@/lib/redis"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookId = params.id
    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 })
    }

    // Delete embedding
    const success = await deleteBookEmbedding(bookId)

    return NextResponse.json({ success })
  } catch (error) {
    console.error("Error removing book from index:", error)
    return NextResponse.json({ error: "Failed to remove book from index" }, { status: 500 })
  }
}
