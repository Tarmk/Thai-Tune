"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { createContext, forwardRef, useContext, useId } from "react"

type InputOTPContextValue = {
  id: string
  maxLength: number
  value: string
  disabled?: boolean
  onChange?: (value: string) => void
  onValueChange?: (value: string) => void
}

const InputOTPContext = createContext<InputOTPContextValue | null>(null)

function useInputOTPContext() {
  const context = useContext(InputOTPContext)
  if (!context) {
    throw new Error("useInputOTPContext must be used within an InputOTP")
  }
  return context
}

interface InputOTPProps {
  maxLength: number
  value: string
  onChange?: (value: string) => void
  onValueChange?: (value: string) => void
  disabled?: boolean
  render?: (props: { slots: string[] }) => React.ReactNode
  className?: string
}

const InputOTP = forwardRef<HTMLDivElement, InputOTPProps>(
  ({ className, maxLength, value, onChange, onValueChange, disabled, render, ...props }, ref) => {
    const id = useId()
    
    const handleChange = React.useCallback(
      (value: string) => {
        onChange?.(value)
        onValueChange?.(value)
      },
      [onChange, onValueChange]
    )

    const contextValue = React.useMemo(
      () => ({
        id,
        maxLength,
        value,
        disabled,
        onChange: handleChange,
        onValueChange: handleChange,
      }),
      [id, maxLength, value, disabled, handleChange]
    )

    return (
      <InputOTPContext.Provider value={contextValue}>
        <div 
          ref={ref} 
          className={cn("flex gap-2", className)}
          {...props}
        >
          {render
            ? render({
                slots: Array.from({ length: maxLength }, (_, i) => value[i] || ""),
              })
            : Array.from({ length: maxLength }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
        </div>
      </InputOTPContext.Provider>
    )
  }
)
InputOTP.displayName = "InputOTP"

interface InputOTPGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const InputOTPGroup = forwardRef<HTMLDivElement, InputOTPGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex items-center gap-2", className)} {...props} />
    )
  }
)
InputOTPGroup.displayName = "InputOTPGroup"

interface InputOTPSlotProps extends React.HTMLAttributes<HTMLInputElement> {
  index?: number
  char?: string
}

const InputOTPSlot = forwardRef<HTMLInputElement, InputOTPSlotProps>(
  ({ className, index = 0, char, ...props }, ref) => {
    const { id, maxLength, value, disabled, onChange } = useInputOTPContext()
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [focused, setFocused] = React.useState(false)

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !e.currentTarget.value) {
        const prevInput = e.currentTarget.previousElementSibling as HTMLInputElement | null
        prevInput?.focus()
      }
      if (e.key === "ArrowLeft") {
        const prevInput = e.currentTarget.previousElementSibling as HTMLInputElement | null
        prevInput?.focus()
      }
      if (e.key === "ArrowRight") {
        const nextInput = e.currentTarget.nextElementSibling as HTMLInputElement | null
        nextInput?.focus()
      }
    }

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.currentTarget.value
      // Only accept numeric inputs
      if (inputValue && !/^[0-9]$/.test(inputValue)) {
        return
      }
      
      const nextValue = value.substring(0, index) + inputValue + value.substring(index + 1)
      onChange?.(nextValue)

      if (inputValue && index < maxLength - 1) {
        const nextInput = e.currentTarget.nextElementSibling as HTMLInputElement | null
        nextInput?.focus()
      }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData("text/plain").trim()
      if (!pastedData || !/^[0-9]+$/.test(pastedData)) return

      const nextValue = value.substring(0, index) + pastedData + value.substring(index + pastedData.length)
      onChange?.(nextValue.substring(0, maxLength))

      if (index + pastedData.length < maxLength) {
        const nextInput = e.currentTarget.nextElementSibling as HTMLInputElement | null
        nextInput?.focus()
      }
    }

    React.useEffect(() => {
      const handleFocus = () => {
        setFocused(true)
      }
      const handleBlur = () => {
        setFocused(false)
      }

      const input = inputRef.current
      if (input) {
        input.addEventListener("focus", handleFocus)
        input.addEventListener("blur", handleBlur)
        return () => {
          input.removeEventListener("focus", handleFocus)
          input.removeEventListener("blur", handleBlur)
        }
      }
    }, [])

    return (
      <input
        ref={ref || inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        maxLength={1}
        disabled={disabled}
        value={char || value[index] || ""}
        className={cn(
          "h-10 w-10 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-[#800000]",
          focused && "ring-2 ring-[#800000] border-[#800000]",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        {...props}
      />
    )
  }
)
InputOTPSlot.displayName = "InputOTPSlot"

export { InputOTP, InputOTPGroup, InputOTPSlot } 