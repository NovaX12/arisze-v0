"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { MessageSquare, Gamepad2, Brain, Rocket, Zap, Trophy, Users, TrendingUp, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ParticleBackground } from "@/components/ui/particle-background"

export default function AIHubPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [onlineUsers, setOnlineUsers] = useState(12)
  const [userStats, setUserStats] = useState({ 
    chatsStarted: 0, 
    quizzesPlayed: 0, 
    wins: 0, 
    totalPoints: 0, 
    rank: "Rookie" 
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

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
      {/* Constellation Background */}
      <ParticleBackground />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />

      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header Section */}
          <motion.header 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center mb-6">
              <Brain className="h-16 w-16 text-primary animate-pulse mr-4" />
              <h1 className="text-6xl md:text-7xl font-serif font-bold gradient-text">
                AI Hub
              </h1>
            </div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              Connect minds, challenge intellects, and explore AI-powered conversations.
              <br />
              <span className="text-primary">Your neural network for learning starts here.</span>
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="inline-flex items-center gap-4"
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

        {/* Stats Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl border-accent/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Your Performance
                </CardTitle>
                <Badge variant="outline" className="border-primary text-primary px-3 py-1">
                  Rank: {userStats.rank}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl border border-primary/30 text-center group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                >
                  <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-bold text-primary">{userStats.chatsStarted}</div>
                  <div className="text-sm text-muted-foreground mt-1">Chats</div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-6 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl border border-secondary/30 text-center group hover:shadow-lg hover:shadow-secondary/20 transition-all duration-300"
                >
                  <Brain className="h-8 w-8 text-secondary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-bold text-secondary">{userStats.quizzesPlayed}</div>
                  <div className="text-sm text-muted-foreground mt-1">Quizzes</div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-6 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl border border-accent/30 text-center group hover:shadow-lg hover:shadow-accent/20 transition-all duration-300"
                >
                  <Trophy className="h-8 w-8 text-accent mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-bold text-accent">{userStats.wins}</div>
                  <div className="text-sm text-muted-foreground mt-1">Wins</div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-6 bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 rounded-xl border border-yellow-500/30 text-center group hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300"
                >
                  <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-bold text-yellow-500">{userStats.totalPoints}</div>
                  <div className="text-sm text-muted-foreground mt-1">Points</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
        </div>
      </div>
    </div>
  )
}


