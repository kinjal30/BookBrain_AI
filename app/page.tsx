import BookSearch from "@/components/book-search"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "BookBrain AI - Intelligent Book Summaries",
  description: "Get AI-powered summaries and insights for your favorite books",
}

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">BookBrain AI</h1>
      <p className="text-center text-lg mb-8">
        Discover books and get AI-powered summaries with our intelligent book platform
      </p>
      <BookSearch />
    </div>
  )
}
