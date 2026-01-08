"use client"

import { Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

interface SearchBarProps {
  placeholder?: string
  onChange?: (value: string) => void
  className?: string
}

export function SearchBar({ placeholder = "Search scores", onChange, className = "" }: SearchBarProps) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Theme-aware colors
  const inputBg = mounted && resolvedTheme === "dark" ? "#212838" : "#f9fafb"
  const inputBorder = mounted && resolvedTheme === "dark" ? "#323A4B" : "#e5e7eb"

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
      <Input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="pl-9 pr-4 py-2 rounded-full transition-colors dark:border-gray-700 dark:text-white dark:placeholder-gray-400 focus:ring-offset-0 focus:ring-1 focus:ring-[#9a3548] border"
        style={{ 
          background: inputBg,
          borderColor: inputBorder
        }}
      />
    </div>
  )
} 