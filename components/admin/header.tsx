"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AdminHeader() {
  const router = useRouter()

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage books and users in the BookBrain AI platform</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => router.push("/admin/books/new")}>Add New Book</Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          View Site
        </Button>
      </div>
    </div>
  )
}
