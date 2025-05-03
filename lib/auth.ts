import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getUserById } from "@/lib/db"
import type { User, Session } from "@/types/book"

// Session management
export async function createSession(user: User): Promise<string> {
  const sessionId = crypto.randomUUID()
  const session: Session = {
    user,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  }

  // In a real app, we would store this in Redis or a database
  // For now, we'll store it in a cookie
  cookies().set({
    name: "session",
    value: JSON.stringify({ id: sessionId, ...session }),
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })

  return sessionId
}

export async function getSession(): Promise<Session | null> {
  const sessionCookie = cookies().get("session")
  if (!sessionCookie) {
    return null
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value)
    if (new Date(sessionData.expires) < new Date()) {
      // Session expired
      cookies().delete("session")
      return null
    }

    return sessionData
  } catch (error) {
    console.error("Error parsing session:", error)
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session) {
    return null
  }

  // In a real app, we would verify the user still exists in the database
  const user = await getUserById(Number.parseInt(session.user.id))
  return user
}

export async function logout(): Promise<void> {
  cookies().delete("session")
}

// Auth middleware helpers
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || !user.isAdmin) {
    redirect("/login")
  }
  return user
}

export async function redirectIfAuthenticated() {
  const user = await getCurrentUser()
  if (user) {
    redirect("/dashboard")
  }
}
