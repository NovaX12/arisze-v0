"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { MessageSquare, Gamepad2, Brain, Rocket, Zap, Trophy, Users, TrendingUp, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ParticleBackground } from "@/components/ui/particle-background"
import { Header } from "@/components/ui/header"

export default function AIHubPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [onlineUsers, setOnlineUsers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // ✅ FIX: Memoize fetch function to prevent re-creation on every render
  const fetchOnlineUsers = useCallback(async () => {
    try {
      // ✅ FIX: Add AbortController for 10s timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      console.log('🔵 Fetching online users...')
      const response = await fetch('/api/users/online', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setOnlineUsers(data.onlineCount || 1)
      setError(null)
      console.log('✅ Online users fetched:', data.onlineCount)

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('❌ Fetch timeout after 10s')
        setError('Connection timeout')
      } else {
        console.error('❌ Failed to fetch online users:', error)
        setError('Failed to load data')
      }
      setOnlineUsers(1) // Fallback to current user only
    } finally {
      setLoading(false)
    }
  }, []) // ✅ Empty deps - function never changes

  // ✅ FIX: Proper useEffect with cleanup
  useEffect(() => {
    if (status === "authenticated") {
      // Initial fetch
      fetchOnlineUsers()
      
      // Refresh every 60 seconds (reduced from 30s for better performance)
      const interval = setInterval(fetchOnlineUsers, 60000)
      
      // ✅ Cleanup on unmount
      return () => {
        console.log('🧹 Cleaning up online users interval')
        clearInterval(interval)
      }
    }
  }, [status, fetchOnlineUsers]) // ✅ Include all dependencies

  // Show loading state while checking authentication
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <ParticleBackground />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center relative z-10"
        >
          <Brain className="h-16 w-16 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            {status === "loading" ? "Connecting to AI Hub..." : "Redirecting to login..."}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Header Navigation */}
      <Header />
      
      {/* Constellation Background - No longer needed here as it's in layout */}
      {/* <ParticleBackground /> */}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

      <div className="relative z-10 py-10 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <motion.header 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center mb-6 gap-4">
              <Brain className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-primary animate-pulse" />
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold gradient-text">
                AI Hub
              </h1>
            </div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4"
            >
              Connect minds, challenge intellects, and explore AI-powered conversations.
              <br className="hidden sm:block" />
              <span className="text-primary">Your neural network for learning starts here.</span>
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
            >
              <div className="flex items-center bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-green-500/30">
                <div className="h-3 w-3 bg-green-400 rounded-full mr-3 animate-pulse" />
                <span className="text-sm font-semibold text-green-400">{onlineUsers} online</span>
              </div>
              <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 text-sm font-semibold shadow-lg">
                <Sparkles className="h-4 w-4 mr-1" />
                Beta
              </Badge>
            </motion.div>
          </motion.header>

          {/* Main Content */}
          <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Chat Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold gradient-text flex items-center gap-2">
                        <MessageSquare className="h-8 w-8" />
                        Focused Chat
                      </CardTitle>
                      <CardDescription className="text-base mt-2">
                        AI-powered conversations with real-time insights
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-muted-foreground">Smart context understanding</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-2 w-2 bg-secondary rounded-full animate-pulse" />
                      <span className="text-muted-foreground">Multi-turn conversations</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-2 w-2 bg-accent rounded-full animate-pulse" />
                      <span className="text-muted-foreground">Safe & moderated</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-all duration-300 shadow-lg text-lg py-6" 
                    size="lg"
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Start Chatting
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{onlineUsers} users active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>AI Enhanced</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quiz Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Card className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/20 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold gradient-text flex items-center gap-2">
                        <Gamepad2 className="h-8 w-8" />
                        Quiz Battles
                      </CardTitle>
                      <CardDescription className="text-base mt-2">
                        Competitive learning with AI-generated questions
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary/10 rounded-lg p-3 border border-primary/20 text-center">
                      <div className="text-2xl font-bold text-primary">10</div>
                      <div className="text-xs text-muted-foreground">Questions</div>
                    </div>
                    <div className="bg-secondary/10 rounded-lg p-3 border border-secondary/20 text-center">
                      <div className="text-2xl font-bold text-secondary">20s</div>
                      <div className="text-xs text-muted-foreground">Per Round</div>
                    </div>
                    <div className="bg-accent/10 rounded-lg p-3 border border-accent/20 text-center">
                      <div className="text-2xl font-bold text-accent">+10</div>
                      <div className="text-xs text-muted-foreground">Base Points</div>
                    </div>
                    <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20 text-center">
                      <div className="text-2xl font-bold text-yellow-500">+5</div>
                      <div className="text-xs text-muted-foreground">Speed Bonus</div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-secondary to-accent hover:scale-105 transition-all duration-300 shadow-lg text-lg py-6" 
                    size="lg"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Launch Battle
                    <Trophy className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <span>AI Generated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Rocket className="h-4 w-4" />
                      <span>Real-time</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </main>

        {/* User Info Section - Real Data */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl border-accent/20">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Welcome, {session?.user?.name || 'User'}!
                </CardTitle>
                <Badge variant="outline" className="border-green-500 text-green-500 px-3 py-1 w-fit">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Online
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Credentials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <div className="text-sm text-muted-foreground mb-1">Name</div>
                  <div className="text-lg font-semibold text-foreground">{session?.user?.name}</div>
                </div>
                <div className="p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                  <div className="text-sm text-muted-foreground mb-1">Email</div>
                  <div className="text-lg font-semibold text-foreground truncate">{session?.user?.email}</div>
                </div>
              </div>

              {/* Coming Soon Features */}
              <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Coming Soon</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                    Chat statistics and history
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-secondary rounded-full" />
                    Quiz performance tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-accent rounded-full" />
                    Friend connections and leaderboards
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.section>
        </div>
      </div>
    </div>
  )
}


