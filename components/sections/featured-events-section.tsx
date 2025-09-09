"use client"

import { motion } from "framer-motion"
import { EventCard } from "@/components/ui/event-card"
import { ChevronRight } from "lucide-react"
import { useEvents } from "@/hooks/use-api"
import { Event } from "@/lib/models"

export function FeaturedEventsSection() {
  const { data: events, loading, error } = useEvents()

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold gradient-text mb-4">Happening This Week</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Loading events...
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold gradient-text mb-4">Happening This Week</h2>
            <p className="text-lg text-red-500 max-w-2xl mx-auto">
              Error loading events: {error}
            </p>
          </div>
        </div>
      </section>
    )
  }

  const featuredEvents = events?.slice(0, 4) || []

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold gradient-text mb-4">Happening This Week</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't miss out on these exciting events happening around Kaunas universities
          </p>
        </motion.div>

        {/* Horizontal Scrolling Container */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {featuredEvents.map((event: Event, index: number) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex-shrink-0"
              >
                <EventCard 
                  event={{
                    id: event._id || '',
                    title: event.title,
                    cafe: event.cafe,
                    image: event.image,
                    date: `${event.date} ${event.time}`,
                    tags: event.tags,
                    attendees: event.attendees,
                    maxAttendees: event.maxAttendees,
                    university: event.university,
                    description: event.description,
                    contact: event.contact,
                    address: event.address
                  }} 
                  featured 
                />
              </motion.div>
            ))}

            {/* Peek Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-20 flex items-center justify-center"
            >
              <div className="glassmorphism rounded-2xl p-6 h-80 flex items-center justify-center cursor-pointer hover:glow-effect transition-all duration-300">
                <ChevronRight className="h-8 w-8 text-accent" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
