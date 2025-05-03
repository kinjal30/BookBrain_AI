import type { Metadata } from "next"
import SemanticSearch from "@/components/semantic-search"

export const metadata: Metadata = {
  title: "Semantic Search - BookBrain AI",
  description: "Search for books by concepts, themes, or similar content",
}

export default function SemanticSearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Semantic Search</h1>
      <SemanticSearch />
    </div>
  )
}
