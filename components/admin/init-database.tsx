"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Database } from "lucide-react"

export default function InitDatabase() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleInitDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/init-db", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to initialize database")
      }

      const data = await response.json()

      toast({
        title: "Database Initialized",
        description: "The database has been successfully initialized with sample data.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize database. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 border rounded-lg bg-muted/30 mb-8">
      <h2 className="text-xl font-semibold mb-2">Database Initialization</h2>
      <p className="text-muted-foreground mb-4">
        Initialize the database with sample books and summaries. This will ensure that the application has data to work
        with and can display book summaries correctly.
      </p>
      <Button onClick={handleInitDatabase} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Initializing Database...
          </>
        ) : (
          <>
            <Database className="mr-2 h-4 w-4" />
            Initialize Database
          </>
        )}
      </Button>
    </div>
  )
}
