"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface FeaturesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FeaturesModal({ isOpen, onClose }: FeaturesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-2xl mx-auto glassmorphism border-0 overflow-hidden">
              {/* Header */}
              <div className="relative p-8 pb-6">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <div className="text-center">
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl font-serif font-bold gradient-text mb-2"
                  >
                    Arisze
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground"
                  >
                    Your University Social Life, Reimagined
                  </motion.p>
                </div>
              </div>

              {/* Features */}
              <div className="px-8 pb-6 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-4 p-6 rounded-2xl bg-muted/10 hover:bg-muted/20 transition-colors"
                >
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Discover & Book Events</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Effortlessly find and book tables at Kaunas's top student-friendly cafes and venues. 
                      Never miss out on the perfect study session, social mixer, or cultural event again.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start gap-4 p-6 rounded-2xl bg-muted/10 hover:bg-muted/20 transition-colors"
                >
                  <div className="p-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Earn & Showcase Badges</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Participate in events, complete challenges, and earn unique badges to display on your profile. 
                      Build your reputation in the university community and unlock exclusive perks.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* CTA Button */}
              <div className="p-8 pt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={onClose}
                    className="w-full rounded-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:scale-105 hover:glow-effect transition-all duration-300"
                    size="lg"
                  >
                    Get Started
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

