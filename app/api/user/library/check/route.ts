"use server"

import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { isBookInUserLibrary } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ inLibrary: false })
    }

    const bookId = req.nextUrl.searchParams.get("bookId")
    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 })
    }

    const inLibrary = await isBookInUserLibrary(Number.parseInt(user.id), Number.parseInt(bookId))
    return NextResponse.json({ inLibrary })
  } catch (error) {
    console.error("Error checking if book is in library:", error)
    return NextResponse.json({ error: "Failed to check if book is in library" }, { status: 500 })
  }
}
