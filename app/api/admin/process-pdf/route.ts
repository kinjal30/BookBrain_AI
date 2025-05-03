"use server"

import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getBookById } from "@/lib/db"
import { generateAIText } from "@/lib/ai-utils"

export async function GET(req: NextRequest) {
  let book
  try {
    const user = await getCurrentUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookId = req.nextUrl.searchParams.get("bookId")
    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 })
    }

    // Get book details
    book = await getBookById(Number.parseInt(bookId))
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // In a real app, we would extract text from the PDF
    // For this demo, we'll generate a summary based on the book details
    const prompt = `Generate a comprehensive summary (about 500 words) of the book "${book.title}" by ${book.author}. 
    The book is about: ${book.description || "Not provided"}. 
    Include the main themes, plot, character development, and significance of the book.
    Make the summary engaging and informative for readers who want to understand the book's content.`

    const summary = await generateAIText(prompt, 1000)

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Error processing PDF:", error)
    return NextResponse.json(
      {
        error: "Failed to process PDF",
        summary: `We couldn't process the PDF for "${book?.title || "this book"}" at this time due to high demand. Please try again later.`,
      },
      { status: 500 },
    )
  }
}
