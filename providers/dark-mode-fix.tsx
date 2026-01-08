'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export function DarkModeFix({ children }: { children: ReactNode }) {
  const [hasLoaded, setHasLoaded] = useState(false)
  const { resolvedTheme } = useTheme()

  // Add a dark background color to <html> element before mounting
  useEffect(() => {
    // First apply an immediate dark background if needed
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark-mode-preload')
      document.documentElement.style.backgroundColor = '#1a1f2c'
    }

    // Wait for theme to be fully resolved
    if (resolvedTheme) {
      setTimeout(() => {
        setHasLoaded(true)
        document.documentElement.classList.add('has-loaded')
        
        // Remove preload class if it exists
        document.documentElement.classList.remove('dark-mode-preload')
      }, 0)
    }
  }, [resolvedTheme])

  return (
    <div className={hasLoaded ? 'has-loaded' : ''}>{children}</div>
  )
} 