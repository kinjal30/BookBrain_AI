"use server"

import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { writeFile } from "fs/promises"
import { join } from "path"
import { mkdir } from "fs/promises"

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const bookId = formData.get("bookId") as string

    if (!file || !bookId) {
      return NextResponse.json({ error: "File and book ID are required" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads")
    await mkdir(uploadsDir, { recursive: true })

    // Create book directory if it doesn't exist
    const bookDir = join(uploadsDir, bookId)
    await mkdir(bookDir, { recursive: true })

    // Save the file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(bookDir, file.name)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      message: "File uploaded successfully",
      filePath: `/uploads/${bookId}/${file.name}`,
      fileSize: file.size,
    })
  } catch (error) {
    console.error("Error uploading PDF:", error)
    return NextResponse.json({ error: "Failed to upload PDF" }, { status: 500 })
  }
}
