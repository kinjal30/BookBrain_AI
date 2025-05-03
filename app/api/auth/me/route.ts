"use server"

import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ user: null })
    }
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error getting current user:", error)
    return NextResponse.json({ error: "Failed to get current user" }, { status: 500 })
  }
}
