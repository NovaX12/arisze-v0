"use client"

import { motion } from "framer-motion"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { useState } from "react"
import { UniversitiesView } from "@/components/sections/universities-view"
import { EventsView } from "@/components/sections/events-view"

export default function EventsPage() {
  const [activeView, setActiveView] = useState<"universities" | "events">("universities")

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
            <h1 className="text-4xl md:text-5xl font-serif font-bold gradient-text mb-4">Events & Activities</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing events happening at universities across Kaunas
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center mb-12"
          >
            <div className="glassmorphism rounded-full p-2 flex">
              <button
                onClick={() => setActiveView("universities")}
                className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeView === "universities"
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                    : "text-muted-foreground hover:text-white"
                }`}
                data-testid="universities-tab"
              >
                Universities
              </button>
              <button
                onClick={() => setActiveView("events")}
                className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeView === "events"
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                    : "text-muted-foreground hover:text-white"
                }`}
                data-testid="events-tab"
              >
                Events
              </button>
            </div>
          </motion.div>

          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeView === "universities" ? <UniversitiesView /> : <EventsView />}
          </motion.div>
        </div>
      </main>
      <Footer />
    </motion.div>
  )
}
