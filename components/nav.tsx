"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, BookOpen, Settings } from "lucide-react"
import { logout } from "@/app/actions/auth"

export function Nav() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          BookBrain AI
        </Link>
        <nav>
          <ul className="flex gap-4 items-center">
            <li>
              <Link href="/" className={pathname === "/" ? "font-medium" : ""}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/books" className={pathname === "/books" ? "font-medium" : ""}>
                Books
              </Link>
            </li>
            <li>
              <Link href="/semantic-search" className={pathname.startsWith("/semantic-search") ? "font-medium" : ""}>
                Semantic Search
              </Link>
            </li>
            {loading ? (
              <li>
                <Button variant="outline" disabled>
                  Loading...
                </Button>
              </li>
            ) : user ? (
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <User className="h-4 w-4 mr-2" />
                      {user.username}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <BookOpen className="h-4 w-4 mr-2" />
                        My Library
                      </Link>
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        logout()
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ) : (
              <li className="flex gap-2">
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
