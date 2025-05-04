import type { Metadata } from "next"
import AdminBookList from "@/components/admin/book-list"
import AdminHeader from "@/components/admin/header"
import IndexBooks from "@/components/admin/index-books"
import InitDatabase from "@/components/admin/init-database"

export const metadata: Metadata = {
  title: "Admin Dashboard - BookBrain AI",
  description: "Manage books and users in the BookBrain AI platform",
}

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader />
      <div className="mt-8">
        <InitDatabase />
        <IndexBooks />
        <AdminBookList />
      </div>
    </div>
  )
}
