"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RecommendationCard } from "@/components/ui/recommendation-card"

// TODO: Connect to MongoDB API. Using placeholder data for now.
const generateRecommendations = (preferences: any) => {
  const baseEvents = [
    {
      id: 1,
      title: "Board Game Strategy Night",
      cafe: "Cozy Corner Cafe",
      image: "/cozy-cafe-with-board-games.jpg",
      date: "Tomorrow, 7:00 PM",
      tags: ["Board Games", "Strategy", "Social"],
      attendees: 8,
      maxAttendees: 12,
      reason: "you enjoy intimate social settings",
      reasonType: "preference",
    },
    {
      id: 2,
      title: "Creative Writing Workshop",
      cafe: "Literary Lounge",
      image: "/artistic-cafe-with-painting-supplies.jpg",
      date: "Friday, 6:00 PM",
      tags: ["Creative", "Writing", "Workshop"],
      attendees: 6,
      maxAttendees: 10,
      reason: "you've attended events at Creative Beans",
      reasonType: "history",
    },
    {
      id: 3,
      title: "Acoustic Open Mic Night",
      cafe: "Melody Lounge",
      image: "/intimate-cafe-with-acoustic-guitar-performance.jpg",
      date: "Saturday, 8:00 PM",
      tags: ["Live Music", "Performance", "Creative"],
      attendees: 15,
      maxAttendees: 25,
      reason: "you love creative activities",
      reasonType: "preference",
    },
    {
      id: 4,
      title: "Study Group: Advanced Programming",
      cafe: "Academic Grounds",
      image: "/modern-study-cafe-with-students.jpg",
      date: "Sunday, 2:00 PM",
      tags: ["Study", "Programming", "Academic"],
      attendees: 5,
      maxAttendees: 8,
      reason: "you enjoy learning and growth",
      reasonType: "preference",
    },
    {
      id: 5,
      title: "Startup Networking Mixer",
      cafe: "Innovation Hub",
      image: "/modern-business-networking-event.jpg",
      date: "Monday, 6:30 PM",
      tags: ["Networking", "Startup", "Professional"],
      attendees: 20,
      maxAttendees: 30,
      reason: "you're interested in building connections",
      reasonType: "preference",
    },
    {
      id: 6,
      title: "Trivia Championship",
      cafe: "Champions Corner",
      image: "/sports-trivia-night-at-cafe.jpg",
      date: "Tuesday, 7:30 PM",
      tags: ["Trivia", "Competition", "Social"],
      attendees: 12,
      maxAttendees: 20,
      reason: "you enjoy challenges and achievement",
      reasonType: "preference",
    },
  ]

  // Filter based on preferences (simplified logic)
  return baseEvents.slice(0, 4)
}

interface RecommendationsGridProps {
  preferences: any
}

export function RecommendationsGrid({ preferences }: RecommendationsGridProps) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    const timer = setTimeout(() => {
      const recs = generateRecommendations(preferences)
      setRecommendations(recs)
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [preferences])

  const refreshRecommendations = () => {
    setLoading(true)
    const timer = setTimeout(() => {
      const recs = generateRecommendations(preferences)
      setRecommendations(recs)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="inline-block"
        >
          <Sparkles className="h-12 w-12 text-accent mb-4" />
        </motion.div>
        <h3 className="text-2xl font-serif font-bold gradient-text mb-2">Crafting Your Perfect Recommendations</h3>
        <p className="text-muted-foreground">Our AI is analyzing your preferences...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-accent" />
          <h2 className="text-3xl font-serif font-bold gradient-text">Recommended For You</h2>
          <Sparkles className="h-6 w-6 text-accent" />
        </div>
        <p className="text-muted-foreground mb-6">
          Based on your preferences, here are some events we think you'll love
        </p>
        <Button
          onClick={refreshRecommendations}
          variant="ghost"
          className="rounded-full border border-accent/30 hover:border-accent hover:glow-effect transition-all duration-300"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Recommendations
        </Button>
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {recommendations.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="break-inside-avoid"
          >
            <RecommendationCard event={event} />
          </motion.div>
        ))}
      </div>

      {/* Reset Quiz */}
      <div className="text-center pt-8">
        <Button
          onClick={() => {
            localStorage.removeItem("arisze-vibe-quiz-completed")
            window.location.reload()
          }}
          variant="ghost"
          className="rounded-full border border-accent/30 hover:border-accent hover:glow-effect transition-all duration-300"
        >
          Retake Vibe Quiz
        </Button>
      </div>
    </div>
  )
}
