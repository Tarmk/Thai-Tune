"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const [isThai, setIsThai] = React.useState(i18n.language === "th")

  const handleLanguageChange = (checked: boolean) => {
    const lang = checked ? "th" : "en"
    setIsThai(checked)
    i18n.changeLanguage(lang)
  }

  React.useEffect(() => {
    setIsThai(i18n.language === "th")
  }, [i18n.language])

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="language-switch" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        EN
      </Label>
      <Switch
        id="language-switch"
        checked={isThai}
        onCheckedChange={handleLanguageChange}
        aria-label="Toggle language"
      />
      <Label htmlFor="language-switch" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        TH
      </Label>
    </div>
  )
} 