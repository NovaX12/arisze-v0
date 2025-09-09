"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { VibeQuiz } from "@/components/sections/vibe-quiz"
import { RecommendationsGrid } from "@/components/sections/recommendations-grid"

export default function AIHubPage() {
  const [isFirstTime, setIsFirstTime] = useState(true)
  const [userPreferences, setUserPreferences] = useState<any>(null)

  useEffect(() => {
    // TODO: Check if user has completed the quiz before
    // For now, simulate first-time user experience
    const hasCompletedQuiz = localStorage.getItem("arisze-vibe-quiz-completed")
    setIsFirstTime(!hasCompletedQuiz)
  }, [])

  const handleQuizComplete = (preferences: any) => {
    setUserPreferences(preferences)
    setIsFirstTime(false)
    localStorage.setItem("arisze-vibe-quiz-completed", "true")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen"
    >
      <Header />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold gradient-text mb-4">AI Hub</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isFirstTime
                ? "Let's discover your perfect university social experience"
                : "Personalized event recommendations just for you"}
            </p>
          </motion.div>

          {isFirstTime ? (
            <VibeQuiz onComplete={handleQuizComplete} />
          ) : (
            <RecommendationsGrid preferences={userPreferences} />
          )}
        </div>
      </main>
      <Footer />
    </motion.div>
  )
}
