"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function IndexBooks() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleIndexAllBooks = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/index-all-books", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to index books")
      }

      const data = await response.json()

      toast({
        title: "Books indexed successfully",
        description: `${data.results.filter((r: any) => r.success).length} books have been indexed for semantic search.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to index books. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 border rounded-lg bg-muted/30 mb-8">
      <h2 className="text-xl font-semibold mb-2">Vector Search Index</h2>
      <p className="text-muted-foreground mb-4">Index all books in the database for semantic search capabilities.</p>
      <Button onClick={handleIndexAllBooks} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Indexing Books...
          </>
        ) : (
          "Index All Books"
        )}
      </Button>
    </div>
  )
}
