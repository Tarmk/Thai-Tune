import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { theme } from "@/lib/theme"

export function useThemeColors() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Return neutral colors during SSR/hydration
  if (!mounted) {
    return {
      // Primary colors
      primary: theme.colors.primary.DEFAULT,
      primaryHover: theme.colors.primary.hover,
      
      // Secondary colors  
      secondary: theme.colors.secondary.DEFAULT,
      secondaryHover: theme.colors.secondary.hover,
      
      // Background colors
      background: theme.colors.background.DEFAULT,
      backgroundCard: theme.colors.background.card,
      
      // Text colors
      textPrimary: theme.colors.text.primary,
      textSecondary: theme.colors.text.secondary,
      textMuted: theme.colors.text.muted,
      textAccent: theme.colors.text.accent,
      
      // Border colors
      border: theme.colors.border.DEFAULT,
      borderFocus: theme.colors.border.focus,
      
      // Button colors
      buttonPrimary: theme.colors.primary.DEFAULT,
      buttonPrimaryHover: theme.colors.primary.hover,
      buttonSecondary: theme.colors.secondary.DEFAULT,
      buttonSecondaryHover: theme.colors.secondary.hover,
      
      // Link colors
      link: theme.colors.text.accent,
      linkHover: theme.colors.secondary.hover,
      
      // Container colors
      containerBackground: theme.colors.background.DEFAULT,
      containerCard: theme.colors.background.card,
      
      // Icon colors
      iconPrimary: theme.colors.text.primary,
      iconSecondary: theme.colors.text.secondary,
      iconAccent: theme.colors.primary.DEFAULT,
    }
  }

  const isDark = resolvedTheme === "dark"

  return {
    // Primary colors
    primary: isDark ? theme.colors.primary[600] : theme.colors.primary.DEFAULT,
    primaryHover: isDark ? theme.colors.primary[500] : theme.colors.primary.hover,
    
    // Secondary colors
    secondary: theme.colors.secondary.DEFAULT,
    secondaryHover: theme.colors.secondary.hover,
    
    // Background colors
    background: isDark ? theme.colors.background.dark : theme.colors.background.light,
    backgroundCard: isDark ? theme.colors.background.darkCard : theme.colors.background.card,
    backgroundSecondary: isDark ? theme.colors.background.darkSecondary : theme.colors.background.gray,
    
    // Text colors
    textPrimary: isDark ? theme.colors.text.darkPrimary : theme.colors.text.primary,
    textSecondary: isDark ? theme.colors.text.darkSecondary : theme.colors.text.secondary,
    textMuted: isDark ? theme.colors.text.darkMuted : theme.colors.text.muted,
    textAccent: isDark ? theme.colors.text.darkAccent : theme.colors.text.accent,
    
    // Border colors
    border: isDark ? theme.colors.border.dark : theme.colors.border.light,
    borderFocus: theme.colors.border.focus,
    
    // Button colors
    buttonPrimary: isDark ? theme.colors.primary[600] : theme.colors.primary.DEFAULT,
    buttonPrimaryHover: isDark ? theme.colors.primary[500] : theme.colors.primary.hover,
    buttonSecondary: theme.colors.secondary.DEFAULT,
    buttonSecondaryHover: theme.colors.secondary.hover,
    
    // Link colors
    link: isDark ? theme.colors.text.darkAccent : theme.colors.text.accent,
    linkHover: isDark ? theme.colors.primary[400] : theme.colors.secondary.hover,
    
    // Container colors
    containerBackground: isDark ? theme.colors.background.dark : theme.colors.background.light,
    containerCard: isDark ? theme.colors.background.darkCard : theme.colors.background.card,
    containerGray: isDark ? theme.colors.background.darkSecondary : theme.colors.background.gray,
    
    // Icon colors
    iconPrimary: isDark ? theme.colors.text.darkPrimary : theme.colors.text.primary,
    iconSecondary: isDark ? theme.colors.text.darkSecondary : theme.colors.text.secondary,
    iconMuted: isDark ? theme.colors.text.darkMuted : theme.colors.text.muted,
    iconAccent: isDark ? theme.colors.primary[600] : theme.colors.primary.DEFAULT,
    
    // Utility
    isDark,
    mounted,
  }
} 