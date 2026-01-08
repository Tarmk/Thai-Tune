"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ArrowRight, CheckCircle, Clock, Mail, RefreshCw, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface VerificationCodeInputProps {
  email: string
  onVerify: (code: string) => Promise<void>
  onResend: () => Promise<void>
  error?: string
}

export function VerificationCodeInput({ email, onVerify, onResend, error }: VerificationCodeInputProps) {
  const router = useRouter()
  const [code, setCode] = React.useState<string[]>(Array(6).fill(""))
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [isVerified, setIsVerified] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState(60)
  const [isResending, setIsResending] = React.useState(false)
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  // Mask email for privacy
  const maskedEmail = email.replace(/(.{3})(.*)(@.*)/, "$1•••$3")

  // The specific maroon color from your theme
  const maroonColor = "#4A1D2C"
  const maroonDark = "#8A3D4C" 
  const maroonLighter = "#6A2D3C" // Slightly lighter for hover states
  const maroonLightest = "#F8F1F3" // Very light for backgrounds

  // Use theme-aware colors
  const buttonColor = mounted && resolvedTheme === "dark" ? maroonDark : maroonColor
  const bgGradient = mounted && resolvedTheme === "dark" 
    ? `linear-gradient(to right, ${maroonDark}, #9A4D5C)` 
    : `linear-gradient(to right, ${maroonColor}, ${maroonLighter})`
  const iconBgColor = mounted && resolvedTheme === "dark" ? "#3A2D35" : maroonLightest
  const linkColor = mounted && resolvedTheme === "dark" ? "#e5a3b4" : maroonColor
  const inputBorderColor = (digit: string) => {
    if (!digit) return undefined
    return mounted && resolvedTheme === "dark" ? maroonDark : maroonColor
  }
  const inputBgColor = (digit: string) => {
    if (!digit) return undefined
    return mounted && resolvedTheme === "dark" ? "#2D2A30" : maroonLightest
  }
  const underlinerColor = (digit: string) => {
    if (!digit) return mounted && resolvedTheme === "dark" ? "#3f3f46" : "#e5e7eb"  
    return mounted && resolvedTheme === "dark" ? maroonDark : maroonColor
  }

  React.useEffect(() => {
    const timer = timeLeft > 0 && !isVerified && setInterval(() => setTimeLeft(timeLeft - 1), 1000)
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [timeLeft, isVerified])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(0, 1)
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    } else if (value && index === 5) {
      // Auto-verify when all digits are filled
      if (newCode.every((digit) => digit !== "")) {
        handleVerify(newCode.join(""))
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()

    // Check if pasted content is a valid 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split("")
      setCode(newCode)
      inputRefs.current[5]?.focus()

      // Auto-verify when pasting a complete code
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (codeToVerify = code.join("")) => {
    if (codeToVerify.length !== 6) return
    
    setIsVerifying(true)
    try {
      await onVerify(codeToVerify)
      setIsVerified(true)
    } catch (err) {
      // Error handling is managed by the parent component
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (timeLeft > 0) return
    
    setIsResending(true)
    try {
      await onResend()
      setTimeLeft(60)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md overflow-hidden border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
      <div className="h-2" style={{ background: bgGradient }} />
      <CardHeader className="space-y-1 pt-6 pb-4">
        <div className="flex justify-center mb-2">
          {isVerified ? (
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="rounded-full p-2" style={{ backgroundColor: iconBgColor }}>
              <Mail className="h-8 w-8" style={{ color: buttonColor }} />
            </div>
          )}
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight dark:text-white">
          {isVerified ? "Email Verified!" : "Verify your email"}
        </h2>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {isVerified
            ? "Your email has been successfully verified."
            : `Enter the 6-digit code sent to ${maskedEmail}`}
        </p>
      </CardHeader>

      <CardContent>
        {!isVerified ? (
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <div key={index} className="relative">
                  <input
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={cn(
                      "h-14 w-12 rounded-md border text-center text-xl font-semibold shadow-sm transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white",
                      error ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20" : "border-gray-200",
                      "focus:outline-none",
                    )}
                    style={{
                      borderColor: inputBorderColor(digit),
                      backgroundColor: inputBgColor(digit),
                    }}
                    aria-label={`Digit ${index + 1}`}
                    autoFocus={index === 0}
                  />
                  <div
                    className="absolute bottom-0 left-0 h-1 w-full rounded-b-md transition-all duration-300"
                    style={{ backgroundColor: underlinerColor(digit) }}
                  />
                </div>
              ))}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
                <p className="flex items-center justify-center text-sm font-medium text-red-800 dark:text-red-400">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {error}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="mb-4 rounded-full bg-green-100 dark:bg-green-900/30 p-6">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-center text-gray-600 dark:text-gray-300">You can now continue using our services</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pb-6">
        {!isVerified ? (
          <>
            <Button
              onClick={() => handleVerify()}
              disabled={isVerifying || code.join("").length !== 6 || isVerified}
              className="w-full text-white"
              style={{
                backgroundColor: buttonColor,
              }}
            >
              {isVerifying ? (
                <span className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                </span>
              ) : (
                <span className="flex items-center">
                  Verify <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm">
              {timeLeft > 0 ? (
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Clock className="mr-1 h-3 w-3" /> Resend code in {timeLeft}s
                </div>
              ) : (
                <button
                  onClick={handleResend}
                  className="flex items-center transition-colors"
                  style={{ color: linkColor }}
                  disabled={isResending}
                >
                  <RefreshCw className={cn("mr-1 h-3 w-3", isResending && "animate-spin")} /> 
                  {isResending ? "Sending..." : "Resend code"}
                </button>
              )}
            </div>
          </>
        ) : (
          <Button
            className="w-full text-white"
            style={{ backgroundColor: buttonColor }}
            onClick={() => router.push("/dashboard")}
          >
            Continue to Dashboard
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}