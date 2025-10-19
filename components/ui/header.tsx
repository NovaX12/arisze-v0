"use client"

import { useState } from "react"
import { Moon, Sun, Menu, X, User, LogOut, HelpCircle } from "lucide-react"
import { useTheme } from "next-themes"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Events & Activities", href: "/events" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header className="sticky top-4 z-50 mx-4">
      <div className="glassmorphism rounded-2xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/">
              <h1 className="text-2xl font-serif font-bold gradient-text italic cursor-pointer hover:scale-105 transition-transform duration-300">
                Arisze
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6" data-testid="main-nav">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative text-sm font-medium transition-all duration-300 hover:text-accent hover:glow-effect text-muted-foreground"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full hover:glow-effect transition-all duration-300"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {status === "loading" ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
              ) : session ? (
                <div className="flex items-center space-x-3">
                  <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity" data-testid="user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} data-testid="header-avatar" />
                      <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-xs">
                        {session.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">{session.user?.name}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="rounded-full border border-accent/50 hover:border-accent hover:glow-effect transition-all duration-300"
                    data-testid="logout-button"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="rounded-full border border-accent/50 hover:border-accent hover:glow-effect transition-all duration-300"
                      data-testid="login-button"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="rounded-full bg-gradient-to-r from-primary to-secondary hover:scale-105 hover:glow-effect transition-all duration-300">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-border">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium transition-colors text-muted-foreground hover:text-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-3">
                {session ? (
                  <>
                    <div className="flex items-center space-x-2 p-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                        <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-xs">
                          {session.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">{session.user?.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="rounded-full border border-accent/50 hover:border-accent hover:glow-effect transition-all duration-300"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="w-full rounded-full border border-accent/50">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full rounded-full bg-gradient-to-r from-primary to-secondary">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
