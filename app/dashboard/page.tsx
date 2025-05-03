import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth"
import { getUserLibrary } from "@/lib/db"
import UserLibrary from "@/components/user-library"
import BookRecommendations from "@/components/book-recommendations"

export const metadata: Metadata = {
  title: "Dashboard - BookBrain AI",
  description: "Your personal dashboard on BookBrain AI",
}

export default async function DashboardPage() {
  const user = await requireAuth()
  const userBooks = await getUserLibrary(Number.parseInt(user.id))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Welcome, {user.username}!</h1>
      <p className="text-muted-foreground mb-8">Manage your books and discover new recommendations</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <UserLibrary initialBooks={userBooks} />
        </div>
        <div>
          <BookRecommendations userId={user.id} />
        </div>
      </div>
    </div>
  )
}
