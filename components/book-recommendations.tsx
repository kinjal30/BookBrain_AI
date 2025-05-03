"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Book } from "@/types/book"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { BookOpen } from "lucide-react"

interface BookRecommendationsProps {
  userId: string
}

export default function BookRecommendations({ userId }: BookRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`/api/recommendations?userId=${userId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch recommendations")
        }
        const data = await response.json()
        setRecommendations(data.books)
      } catch (error) {
        console.error("Error fetching recommendations:", error)
        toast({
          title: "Error",
          description: "Failed to load book recommendations",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [userId, toast])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
        <CardDescription>Based on your reading preferences</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-12 h-16 bg-muted rounded" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Add books to your library to get recommendations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((book) => (
              <div key={book.id} className="flex items-center gap-4">
                <div className="w-12 h-16 bg-muted rounded overflow-hidden">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage || "/placeholder.svg"}
                      alt={`Cover of ${book.title}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <BookOpen size={24} />
                    </div>
                  )}
                </div>
                <div>
                  <Link href={`/books/${book.id}`} className="font-medium hover:underline">
                    {book.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Link href="/books">
                <Button variant="outline" size="sm" className="w-full">
                  Browse More Books
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
