"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { register } from "@/app/actions/auth"
import { useActionState } from "react"
import { useState, useEffect } from "react"

const initialState = { error: null, success: false }

export default function RegisterPage() {
  const router = useRouter()
  const [state, formAction] = useActionState(register, initialState)
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
        title: "Registration failed",
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
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Register to access BookBrain AI</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full">
              Register
            </Button>
            <p className="text-sm text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
