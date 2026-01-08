"use client"

import { type ReactNode, useEffect, useState } from "react"
import { I18nextProvider } from "react-i18next"
import i18n from "@/i18n"

type Props = {
  children: ReactNode
}

export default function I18nProvider({ children }: Props) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Return a simple wrapper when rendering on server
    return <>{children}</>
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
