import { type NextRequest, NextResponse } from "next/server"
import { getAllBooks, indexBook } from "@/lib/api"

export async function POST(req: NextRequest) {
  try {
    // Get all books
    const books = await getAllBooks()

    // Index each book
    const results = await Promise.all(
      books.map(async (book) => {
        const success = await indexBook(book)
        return { id: book.id, title: book.title, success }
      }),
    )

    return NextResponse.json({
      message: "Books indexed successfully",
      results,
    })
  } catch (error) {
    console.error("Error indexing all books:", error)
    return NextResponse.json({ error: "Failed to index books" }, { status: 500 })
  }
}
