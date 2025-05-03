"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import type { Book } from "@/types/book"
import { getBookById, getBookSummary } from "@/lib/api"
import { Loader2, BookPlus, Check, AlertCircle } from "lucide-react"
import { addToLibrary, removeFromLibrary } from "@/app/actions/books"
import PdfUpload from "@/components/admin/pdf-upload"

export default function BookDetailPage() {
  const params = useParams()
  const bookId = params.id as string
  const [book, setBook] = useState<Book | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isInLibrary, setIsInLibrary] = useState(false)
  const [libraryActionLoading, setLibraryActionLoading] = useState(false)
  const [summaryError, setSummaryError] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch book details
        const bookData = await getBookById(bookId)
        setBook(bookData)

        // Fetch user data
        const userResponse = await fetch("/api/auth/me")
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData.user)

          // Check if book is in user's library
          if (userData.user) {
            const libraryResponse = await fetch(`/api/user/library/check?bookId=${bookId}`)
            if (libraryResponse.ok) {
              const { inLibrary } = await libraryResponse.json()
              setIsInLibrary(inLibrary)
            }
          }
        }

        // Try to fetch summary
        try {
          const bookSummary = await getBookSummary(bookId)
          setSummary(bookSummary)

          // Check if we got a fallback or error message
          if (
            bookSummary.includes("We're currently experiencing high demand") ||
            bookSummary.includes("Unable to generate summary")
          ) {
            setSummaryError(true)
          }
        } catch (error) {
          console.error("Error fetching summary:", error)
          // We don't show an error toast here as the summary might not exist yet
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load book details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [bookId, toast])

  const handleGetSummary = async () => {
    if (summary) return

    setSummaryLoading(true)
    setSummaryError(false)
    try {
      const bookSummary = await getBookSummary(bookId)
      setSummary(bookSummary)

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
        `We're currently experiencing high demand and couldn't generate a custom summary at this moment. Please try again later.`,
      )
    } finally {
      setSummaryLoading(false)
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
        const result = await removeFromLibrary(bookId)
        if (result.error) {
          throw new Error(result.error)
        }
        setIsInLibrary(false)
        toast({
          title: "Book removed",
          description: "The book has been removed from your library",
        })
      } else {
        const result = await addToLibrary(bookId)
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

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading book details...</div>
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Book Not Found</h1>
        <p>The book you are looking for does not exist.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{book.title}</h1>

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="w-full md:w-1/3">
            <div className="w-full h-80 bg-muted rounded overflow-hidden">
              {book.coverImage ? (
                <img
                  src={book.coverImage || "/placeholder.svg"}
                  alt={`Cover of ${book.title}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No cover available
                </div>
              )}
            </div>
            {user && (
              <Button
                onClick={handleLibraryAction}
                variant={isInLibrary ? "outline" : "default"}
                disabled={libraryActionLoading}
                className="w-full mt-4"
              >
                {libraryActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : isInLibrary ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    In Your Library
                  </>
                ) : (
                  <>
                    <BookPlus className="h-4 w-4 mr-2" />
                    Add to Library
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="w-full md:w-2/3">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">About the Book</h2>
                <p className="text-muted-foreground">Author: {book.author}</p>
                <p className="text-muted-foreground">Year: {book.year}</p>
                <p className="text-muted-foreground">Genre: {book.genre}</p>
              </div>

              {book.description && (
                <div>
                  <h3 className="text-lg font-semibold">Description</h3>
                  <p>{book.description}</p>
                </div>
              )}

              {!summary && !summaryLoading && <Button onClick={handleGetSummary}>Get AI Summary</Button>}

              {summaryLoading && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating AI Summary...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {summary && (
          <div className="mt-8 p-6 border rounded-lg bg-muted/30">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              AI-Generated Summary
              {summaryError && (
                <span className="flex items-center text-sm font-normal text-amber-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Limited availability mode
                </span>
              )}
            </h2>
            <p className="leading-relaxed">{summary}</p>
          </div>
        )}

        {user && user.isAdmin && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
            <PdfUpload bookId={bookId} />
          </div>
        )}
      </div>
    </div>
  )
}
