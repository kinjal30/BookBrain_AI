"use server"

import { type NextRequest, NextResponse } from "next/server"
import { getAllBooks, initializeDatabase } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    // Initialize database if needed
    await initializeDatabase()

    const books = await getAllBooks()
    return NextResponse.json({ books })
  } catch (error) {
    console.error("Error getting all books:", error)
    return NextResponse.json({ error: "Failed to get books" }, { status: 500 })
  }
}
