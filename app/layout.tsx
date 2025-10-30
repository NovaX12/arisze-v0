import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Inter } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/providers"
import { ErrorBoundary } from "@/components/error-boundary"
import { Suspense } from "react"
import { Toaster } from "sonner"
import { DebugPanel } from "@/components/ui/debug-panel"
import { ParticleBackground } from "@/components/ui/particle-background"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Arisze - Your University Social Life, Reimagined",
  description: "Student leisure planning web application for university students in Kaunas, Lithuania",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} ${poppins.variable} ${GeistMono.variable} antialiased`}>
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Providers>
              <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                {/* Celestial Background - Fixed position, lowest z-index */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                  <ParticleBackground />
                </div>
                
                {/* Main Content - Higher z-index */}
                <div className="relative z-10">
                  {children}
                </div>
                
                <Toaster richColors position="top-right" />
                <DebugPanel />
              </ThemeProvider>
            </Providers>
          </Suspense>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
