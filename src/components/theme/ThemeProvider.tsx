import { useEffect } from "react"
import { ThemeProviderContext, useThemeProvider } from "@/hooks/useTheme"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: "dark" | "light" | "system"
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: ThemeProviderProps) {
  const themeProvider = useThemeProvider()

  return (
    <ThemeProviderContext.Provider value={themeProvider}>
      {children}
    </ThemeProviderContext.Provider>
  )
}