"use client"

import { motion } from "framer-motion"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { DebugPanel } from "@/components/ui/debug-panel"
import { useState } from "react"
import { EventsView } from "@/components/sections/events-view"
import { CreateEventView } from "@/components/sections/create-event-view"

export default function EventsPage() {
  const [activeView, setActiveView] = useState<"browse" | "create">("browse")

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
              Book amazing events or create your own for the community
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
                onClick={() => setActiveView("browse")}
                className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeView === "browse"
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                    : "text-muted-foreground hover:text-white"
                }`}
                data-testid="browse-events-tab"
              >
                Book Events
              </button>
              <button
                onClick={() => setActiveView("create")}
                className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeView === "create"
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                    : "text-muted-foreground hover:text-white"
                }`}
                data-testid="create-event-tab"
              >
                Create Event
              </button>
            </div>
          </motion.div>

          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeView === "browse" ? <EventsView /> : <CreateEventView />}
          </motion.div>
        </div>
      </main>
      <Footer />
      <DebugPanel />
    </motion.div>
  )
}
