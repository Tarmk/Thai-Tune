export const theme = {
  colors: {
    // Primary brand colors (Maroon theme)
    primary: {
      50: "#F8F1F3",
      100: "#F0E3E7", 
      200: "#E5C7CF",
      300: "#D4A1B0",
      400: "#C17A91",
      500: "#AF5169", // Light maroon for dark theme
      600: "#8A3D4C", // Medium maroon
      700: "#4A1D2C", // Main maroon (primary)
      800: "#3A1622", // Dark maroon (hover)
      900: "#2A1018", // Darkest maroon
      DEFAULT: "#4A1D2C",
      hover: "#3A1622",
      foreground: "white",
    },
    
    // Secondary colors (Deep red/burgundy)
    secondary: {
      50: "#FEF2F2",
      100: "#FEE2E2",
      200: "#FECACA", 
      300: "#FCA5A5",
      400: "#F87171",
      500: "#EF4444",
      600: "#DC2626",
      700: "#B91C1C",
      800: "#991B1B",
      900: "#7F1D1D",
      DEFAULT: "#800000", // Keep existing secondary
      hover: "#600000",
      foreground: "white",
    },

    // Background colors
    background: {
      light: "#FFFFFF",
      gray: "#F5F5F5", 
      card: "#FFFFFF",
      dark: "#1a1f2c",
      darkCard: "#232838",
      darkSecondary: "#2a3349",
      DEFAULT: "#F5F5F5",
    },

    // Text colors
    text: {
      primary: "#333333",
      secondary: "#666666", 
      muted: "#999999",
      light: "#FFFFFF",
      darkPrimary: "#FFFFFF",
      darkSecondary: "#D1D5DB",
      darkMuted: "#9CA3AF",
      accent: "#800000", // For links in light mode
      darkAccent: "#e5a3b4", // For links in dark mode
    },

    // Border and UI colors
    border: {
      light: "#E5E5E5",
      dark: "#374151",
      focus: "#800000",
      DEFAULT: "#E5E5E5",
    },

    // Status colors
    status: {
      success: "#10B981",
      warning: "#F59E0B", 
      error: "#EF4444",
      info: "#3B82F6",
    },
  },
  
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "4rem",
  },
  
  borderRadius: {
    sm: "0.125rem",
    DEFAULT: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "1rem",
    full: "9999px",
  },
}
