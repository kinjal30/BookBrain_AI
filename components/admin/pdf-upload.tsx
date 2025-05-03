"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"
import { saveBookSummaryAction, saveBookFileAction } from "@/app/actions/books"

interface PdfUploadProps {
  bookId: string
}

export default function PdfUpload({ bookId }: PdfUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to upload",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      // Upload the file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("bookId", bookId)

      const uploadResponse = await fetch("/api/admin/upload-pdf", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload PDF")
      }

      const uploadData = await uploadResponse.json()
      const { filePath, fileSize } = uploadData

      // Save file info in database
      await saveBookFileAction(bookId, filePath, fileSize)

      // Process the PDF and generate summary
      setUploading(false)
      setProcessing(true)

      const processResponse = await fetch(`/api/admin/process-pdf?bookId=${bookId}`)

      if (!processResponse.ok) {
        throw new Error("Failed to process PDF")
      }

      const processData = await processResponse.json()
      const { summary } = processData

      // Save the summary
      await saveBookSummaryAction(bookId, summary)

      toast({
        title: "PDF uploaded and processed",
        description: "The book summary has been generated and saved",
      })
    } catch (error) {
      console.error("Error uploading PDF:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload and process PDF",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload PDF</CardTitle>
        <CardDescription>Upload a PDF file to generate a summary for this book</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pdf-file">PDF File</Label>
            <Input
              id="pdf-file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={uploading || processing}
            />
          </div>
          {file && (
            <p className="text-sm text-muted-foreground">
              Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={!file || uploading || processing}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing PDF...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload and Process
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
