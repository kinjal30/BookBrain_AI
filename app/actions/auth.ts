"use server"

import { redirect } from "next/navigation"
import { createUser, verifyCredentials } from "@/lib/db"
import { createSession, logout as logoutSession } from "@/lib/auth"

export async function register(prevState: any, formData: FormData) {
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  // Validate input
  if (!username || !email || !password || !confirmPassword) {
    return { error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  try {
    const user = await createUser(username, email, password)
    if (!user) {
      return { error: "Failed to create user" }
    }

    // Create session
    await createSession(user)

    // Return success instead of redirecting
    return { success: true }
  } catch (error: any) {
    console.error("Registration error:", error)
    if (error.code === "23505") {
      // Unique violation
      if (error.constraint === "users_email_key") {
        return { error: "Email already in use" }
      }
      if (error.constraint === "users_username_key") {
        return { error: "Username already in use" }
      }
    }
    return { error: "An error occurred during registration" }
  }
}

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate input
  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const user = await verifyCredentials(email, password)
    if (!user) {
      return { error: "Invalid email or password" }
    }

    // Create session
    await createSession(user)

    // Return success instead of redirecting
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An error occurred during login" }
  }
}

export async function logout() {
  await logoutSession()
  redirect("/login")
}
