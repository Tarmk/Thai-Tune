"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AuthFormProps {
  type: "login" | "signup"
  onSubmit: (data: { email: string; password: string; name?: string }) => Promise<void>
  translations: {
    title: string
    description: string
    submitButton: string
    loadingText: string
    alternateActionText: string
    alternateActionLink: string
    alternateActionLinkText: string
  }
}

export function AuthForm({ type, onSubmit, translations }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await onSubmit({ email, password, ...(type === "signup" ? { name } : {}) })
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{translations.title}</CardTitle>
          <CardDescription className="text-center">{translations.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/" className="absolute top-4 left-4 flex items-center text-[#800000] hover:text-[#600000]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-4">
              {type === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button className="w-full mt-4" type="submit" isLoading={isLoading}>
              {isLoading ? translations.loadingText : translations.submitButton}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            {translations.alternateActionText}{" "}
            <Link href={translations.alternateActionLink} className="text-[#800000] hover:underline">
              {translations.alternateActionLinkText}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
