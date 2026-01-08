"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{this.state.error?.message || "An unexpected error occurred"}</p>
            <Button onClick={() => this.setState({ hasError: false })} className="mr-4">
              Try again
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/">
                Go to homepage
              </Link>
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
