"use server"

import { type NextRequest, NextResponse } from "next/server"
import { getBookSummary, getBookById, saveBookSummary } from "@/lib/db"
import { generateAIText } from "@/lib/ai-utils"

// Cache for summaries to reduce API calls
const summaryCache = new Map<string, { summary: string; timestamp: number }>()
const CACHE_TTL = 3600000 // 1 hour in milliseconds

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookId = params.id
    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 })
    }

    // Check cache first
    const cachedSummary = summaryCache.get(bookId)
    if (cachedSummary && Date.now() - cachedSummary.timestamp < CACHE_TTL) {
      console.log(`Returning cached summary for book ${bookId}`)
      return NextResponse.json({ summary: cachedSummary.summary })
    }

    // Try to get existing summary from database
    console.log(`Fetching summary from database for book ${bookId}`)
    const dbSummary = await getBookSummary(Number.parseInt(bookId))

    if (dbSummary) {
      console.log(`Found summary in database for book ${bookId}`)
      // Update cache
      summaryCache.set(bookId, { summary: dbSummary, timestamp: Date.now() })
      return NextResponse.json({ summary: dbSummary })
    }

    console.log(`No summary found in database for book ${bookId}, generating new summary`)
    // If no summary exists, generate one
    const book = await getBookById(Number.parseInt(bookId))
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Generate summary using OpenAI
    const prompt = `Generate a concise summary (about 250 words) of the book "${book.title}" by ${book.author}. 
    The book is about: ${book.description || "Not provided"}. 
    Focus on the main themes, plot, and significance of the book.`

    console.log(`Generating AI summary for book ${bookId}`)
    const generatedSummary = await generateAIText(prompt, 500)

    // Try to save the summary to the database if it's not a fallback
    if (!generatedSummary.includes("We're currently experiencing high demand")) {
      try {
        console.log(`Saving generated summary to database for book ${bookId}`)
        await saveBookSummary(Number.parseInt(bookId), generatedSummary)
      } catch (saveError) {
        console.error("Error saving summary to database:", saveError)
        // Continue even if saving fails
      }
    }

    // Update cache
    summaryCache.set(bookId, { summary: generatedSummary, timestamp: Date.now() })

    return NextResponse.json({ summary: generatedSummary })
  } catch (error) {
    console.error("Error getting book summary:", error)
    return NextResponse.json({
      summary: "Unable to generate summary at this time. Please try again later.",
    })
  }
}
