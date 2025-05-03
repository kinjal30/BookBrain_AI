import { type NextRequest, NextResponse } from "next/server"
import { generateAIText } from "@/lib/ai-utils"
import { getBookById } from "@/lib/api"

export async function POST(req: NextRequest) {
  try {
    const { bookId } = await req.json()

    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 })
    }

    // Get book details
    const book = await getBookById(bookId)

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Generate summary using OpenAI
    const prompt = `Generate a concise summary (about 150 words) of the book "${book.title}" by ${book.author}. 
    The book is about: ${book.description || "Not provided"}. 
    Focus on the main themes, plot, and significance of the book.`

    const summary = await generateAIText(prompt, 500)

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Error generating book summary:", error)
    return NextResponse.json({ error: "Failed to generate book summary" }, { status: 500 })
  }
}
