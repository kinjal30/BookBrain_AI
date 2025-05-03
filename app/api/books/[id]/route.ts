"use server"

import { type NextRequest, NextResponse } from "next/server"
import { getBookById } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookId = params.id
    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 })
    }

    const book = await getBookById(Number.parseInt(bookId))
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    return NextResponse.json({ book })
  } catch (error) {
    console.error("Error getting book:", error)
    return NextResponse.json({ error: "Failed to get book" }, { status: 500 })
  }
}
