"use server"

import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const user = await getCurrentUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize database
    const success = await initializeDatabase()

    if (success) {
      return NextResponse.json({ message: "Database initialized successfully" })
    } else {
      return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json({ error: "An error occurred while initializing the database" }, { status: 500 })
  }
}
