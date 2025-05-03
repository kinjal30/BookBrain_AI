"use server"

import { type NextRequest, NextResponse } from "next/server"
import { searchBooks } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q")
    if (!query) {
      return NextResponse.json({ books: [] })
    }

    const books = await searchBooks(query)
    return NextResponse.json({ books })
  } catch (error) {
    console.error("Error searching books:", error)
    return NextResponse.json({ error: "Failed to search books" }, { status: 500 })
  }
}
