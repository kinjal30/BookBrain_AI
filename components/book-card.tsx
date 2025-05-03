"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Book } from "@/types/book"
import { getBookSummary } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, BookPlus, Check, AlertCircle } from "lucide-react"
import { addToLibrary, removeFromLibrary } from "@/app/actions/books"

interface BookCardProps {
  book: Book
  inLibrary?: boolean
}

export function BookCard({ book, inLibrary = false }: BookCardProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [isInLibrary, setIsInLibrary] = useState(inLibrary)
  const [libraryActionLoading, setLibraryActionLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [summaryError, setSummaryError] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)

          // Check if book is in user's library
          if (userData.user) {
            const libraryResponse = await fetch(`/api/user/library/check?bookId=${book.id}`)
            if (libraryResponse.ok) {
              const { inLibrary } = await libraryResponse.json()
              setIsInLibrary(inLibrary)
            }
          }
        }
      } catch (error) {
        console.error("Error checking user:", error)
      }
    }

    checkUser()
  }, [book.id])

  const handleGetSummary = async () => {
    if (summary) {
      setShowSummary(!showSummary)
      return
    }

    setLoading(true)
    setSummaryError(false)
    try {
      const bookSummary = await getBookSummary(book.id)
      setSummary(bookSummary)
      setShowSummary(true)

      // Check if we got a fallback or error message
      if (
        bookSummary.includes("We're currently experiencing high demand") ||
        bookSummary.includes("Unable to generate summary")
      ) {
        setSummaryError(true)
      }
    } catch (error) {
      console.error("Error getting summary:", error)
      setSummaryError(true)
      toast({
        title: "Summary Unavailable",
        description: "We couldn't generate a summary right now. Please try again later.",
        variant: "destructive",
      })

      // Set a generic summary as fallback
      setSummary(
        `We're currently experiencing high demand and couldn't generate a custom summary for "${book.title}" at this moment. Please try again later.`,
      )
      setShowSummary(true)
    } finally {
      setLoading(false)
    }
  }

  const handleLibraryAction = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to add books to your library",
        variant: "destructive",
      })
      return
    }

    setLibraryActionLoading(true)
    try {
      if (isInLibrary) {
        const result = await removeFromLibrary(book.id)
        if (result.error) {
          throw new Error(result.error)
        }
        setIsInLibrary(false)
        toast({
          title: "Book removed",
          description: "The book has been removed from your library",
        })
      } else {
        const result = await addToLibrary(book.id)
        if (result.error) {
          throw new Error(result.error)
        }
        setIsInLibrary(true)
        toast({
          title: "Book added",
          description: "The book has been added to your library",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLibraryActionLoading(false)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>
          <Link href={`/books/${book.id}`} className="hover:underline">
            {book.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex gap-4 mb-4">
          <div className="w-24 h-36 bg-muted rounded overflow-hidden">
            {book.coverImage ? (
              <img
                src={book.coverImage || "/placeholder.svg"}
                alt={`Cover of ${book.title}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No cover</div>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Author: {book.author}</p>
            <p className="text-sm text-muted-foreground mb-1">Year: {book.year}</p>
            <p className="text-sm text-muted-foreground">Genre: {book.genre}</p>
          </div>
        </div>

        {showSummary && summary && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              Summary
              {summaryError && <AlertCircle className="h-4 w-4 text-amber-500" title="Generated with fallback" />}
            </h4>
            <p className="text-sm">{summary}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={handleGetSummary} disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Summary
            </>
          ) : showSummary ? (
            "Hide Summary"
          ) : summary ? (
            "Show Summary"
          ) : (
            "Get AI Summary"
          )}
        </Button>
        {user && (
          <Button
            onClick={handleLibraryAction}
            variant={isInLibrary ? "outline" : "default"}
            disabled={libraryActionLoading}
          >
            {libraryActionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isInLibrary ? (
              <Check className="h-4 w-4" />
            ) : (
              <BookPlus className="h-4 w-4" />
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
