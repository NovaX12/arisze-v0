"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface QuizChoice {
  id: string
  title: string
  description: string
  image: string
  tags: string[]
}

const quizSteps = [
  {
    question: "What's your ideal social atmosphere?",
    choices: [
      {
        id: "cozy",
        title: "Cozy & Intimate",
        description: "Small groups, meaningful conversations",
        image: "/cozy-cafe-with-board-games.jpg",
        tags: ["intimate", "conversation", "small-group"],
      },
      {
        id: "energetic",
        title: "Energetic & Lively",
        description: "Big crowds, high energy, lots of activity",
        image: "/intimate-cafe-with-acoustic-guitar-performance.jpg",
        tags: ["energetic", "crowd", "active"],
      },
    ],
  },
  {
    question: "How do you prefer to spend your free time?",
    choices: [
      {
        id: "creative",
        title: "Creative Activities",
        description: "Art, music, crafts, and self-expression",
        image: "/artistic-cafe-with-painting-supplies.jpg",
        tags: ["creative", "art", "music", "crafts"],
      },
      {
        id: "intellectual",
        title: "Learning & Growth",
        description: "Study groups, discussions, skill building",
        image: "/modern-study-cafe-with-students.jpg",
        tags: ["learning", "academic", "discussion", "growth"],
      },
    ],
  },
  {
    question: "What motivates you most?",
    choices: [
      {
        id: "connection",
        title: "Building Connections",
        description: "Meeting new people and forming friendships",
        image: "/modern-business-networking-event.jpg",
        tags: ["networking", "social", "friendship", "connection"],
      },
      {
        id: "achievement",
        title: "Personal Achievement",
        description: "Competing, winning, and personal growth",
        image: "/sports-trivia-night-at-cafe.jpg",
        tags: ["competition", "achievement", "growth", "challenge"],
      },
    ],
  },
]

interface VibeQuizProps {
  onComplete: (preferences: any) => void
}

export function VibeQuiz({ onComplete }: VibeQuizProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedChoices, setSelectedChoices] = useState<QuizChoice[]>([])
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)

  const handleChoiceSelect = (choice: QuizChoice) => {
    setSelectedChoice(choice.id)
  }

  const handleNext = () => {
    if (selectedChoice) {
      const choice = quizSteps[currentStep].choices.find((c) => c.id === selectedChoice)
      if (choice) {
        setSelectedChoices([...selectedChoices, choice])
      }

      if (currentStep < quizSteps.length - 1) {
        setCurrentStep(currentStep + 1)
        setSelectedChoice(null)
      } else {
        // Quiz complete
        const preferences = {
          choices: [...selectedChoices, choice!],
          tags: [...selectedChoices, choice!].flatMap((c) => c.tags),
          completedAt: new Date().toISOString(),
        }
        onComplete(preferences)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setSelectedChoices(selectedChoices.slice(0, -1))
      setSelectedChoice(null)
    }
  }

  const currentQuizStep = quizSteps[currentStep]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {quizSteps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(((currentStep + 1) / quizSteps.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-muted/20 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full glow-effect"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / quizSteps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Quiz Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 glassmorphism border-0 mb-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-serif font-bold gradient-text">Find Your Vibe</h2>
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{currentQuizStep.question}</h3>
              <p className="text-muted-foreground">Choose the option that resonates with you most</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {currentQuizStep.choices.map((choice) => (
                <motion.div
                  key={choice.id}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedChoice === choice.id ? "ring-2 ring-accent glow-effect" : ""
                  }`}
                  onClick={() => handleChoiceSelect(choice)}
                >
                  <Card
                    className={`overflow-hidden border-0 transition-all duration-300 ${
                      selectedChoice === choice.id
                        ? "bg-accent/10 border-accent"
                        : "bg-card/50 hover:bg-card/70 hover:shadow-lg hover:shadow-accent/20"
                    }`}
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={choice.image || "/placeholder.svg"}
                        alt={choice.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {selectedChoice === choice.id && (
                        <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-12 h-12 bg-accent rounded-full flex items-center justify-center"
                          >
                            <Sparkles className="h-6 w-6 text-white" />
                          </motion.div>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-serif font-semibold mb-2">{choice.title}</h4>
                      <p className="text-muted-foreground">{choice.description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="rounded-full border border-accent/30 hover:border-accent hover:glow-effect transition-all duration-300"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!selectedChoice}
              className="rounded-full bg-gradient-to-r from-primary to-secondary hover:scale-105 hover:glow-effect transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === quizSteps.length - 1 ? "Get My Recommendations" : "Next"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
