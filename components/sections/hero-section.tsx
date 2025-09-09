"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ParticleBackground } from "@/components/ui/particle-background"
import { FeaturesModal } from "@/components/ui/features-modal"

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight"
        >
          <span className="gradient-text">Your University</span>
          <br />
          <span className="gradient-text">Social Life,</span>
          <br />
          <span className="gradient-text">Reimagined.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          Connect with fellow students in Kaunas, discover exciting events, and make lasting memories. Your perfect
          university experience starts here.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/events">
            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:scale-105 hover:glow-effect transition-all duration-300 shadow-lg"
            >
              Explore Events Now
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="lg"
            className="rounded-full px-8 py-6 text-lg font-semibold border border-accent/50 hover:border-accent hover:glow-effect transition-all duration-300"
            onClick={() => setIsModalOpen(true)}
          >
            Learn More
          </Button>
        </motion.div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20 pointer-events-none" />
    </section>

    {/* Features Modal */}
    <FeaturesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
