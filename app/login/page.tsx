"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { login } from "@/app/actions/auth"
import { useActionState } from "react"
import { useState, useEffect } from "react"

const initialState = { error: null, success: false }

export default function LoginPage() {
  const router = useRouter()
  const [state, formAction] = useActionState(login, initialState)
  const [showError, setShowError] = useState(false)
  const { toast } = useToast()

  // Handle success and redirect
  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard")
    }
  }, [state, router])

  // Use useEffect to handle showing the toast
  useEffect(() => {
    if (state?.error && !showError) {
      toast({
        title: "Login failed",
        description: state.error,
        variant: "destructive",
      })
      setShowError(true)
    }
  }, [state, toast, showError])

  // Reset showError when the component re-renders
  useEffect(() => {
    return () => {
      setShowError(false)
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login to BookBrain AI</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="admin@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full">
              Login
            </Button>
            <p className="text-sm text-center text-muted-foreground mt-4">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
            <p className="text-sm text-center text-muted-foreground mt-2">
              For admin access: admin@bookbrain.ai / admin
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
