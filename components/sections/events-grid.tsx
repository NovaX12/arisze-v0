"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { EventCard } from "@/components/ui/event-card"
import { EventSkeletonCard } from "@/components/ui/event-skeleton-card"
import { BookingModal } from "@/components/ui/booking-modal"
import type { EventFilters } from "@/app/events/page"

// TODO: Connect to MongoDB API. Using placeholder data for now.
const allEvents = [
  {
    id: 1,
    title: "Board Game Night",
    cafe: "Cozy Corner Cafe",
    image: "/cozy-cafe-with-board-games.jpg",
    date: "Tonight, 7:00 PM",
    tags: ["Board Games", "Social"],
    attendees: 12,
    maxAttendees: 20,
    university: "Kaunas University of Technology",
    description: "Join us for an evening of strategic fun and social connection!",
    contact: "+370 123 4567",
    address: "Studentų g. 50, Kaunas",
  },
  {
    id: 2,
    title: "Study Group Session",
    cafe: "Academic Grounds",
    image: "/modern-study-cafe-with-students.jpg",
    date: "Tomorrow, 2:00 PM",
    tags: ["Study Group", "Academic"],
    attendees: 8,
    maxAttendees: 15,
    university: "Vytautas Magnus University",
    description: "Collaborative study session for upcoming exams.",
    contact: "+370 234 5678",
    address: "V. Putvinskio g. 23, Kaunas",
  },
  {
    id: 3,
    title: "Live Acoustic Music",
    cafe: "Melody Lounge",
    image: "/intimate-cafe-with-acoustic-guitar-performance.jpg",
    date: "Friday, 8:00 PM",
    tags: ["Live Music", "Entertainment"],
    attendees: 25,
    maxAttendees: 30,
    university: "Lithuanian University of Health Sciences",
    description: "Enjoy live acoustic performances by local student artists.",
    contact: "+370 345 6789",
    address: "A. Mickevičiaus g. 9, Kaunas",
  },
  {
    id: 4,
    title: "Art & Coffee Workshop",
    cafe: "Creative Beans",
    image: "/artistic-cafe-with-painting-supplies.jpg",
    date: "Saturday, 10:00 AM",
    tags: ["Art Workshop", "Social"],
    attendees: 6,
    maxAttendees: 12,
    university: "Kaunas College",
    description: "Express your creativity while enjoying premium coffee.",
    contact: "+370 456 7890",
    address: "Pramonės pr. 20, Kaunas",
  },
  {
    id: 5,
    title: "Networking Mixer",
    cafe: "Business Hub Cafe",
    image: "/modern-business-networking-event.jpg",
    date: "Sunday, 6:00 PM",
    tags: ["Networking", "Social"],
    attendees: 18,
    maxAttendees: 25,
    university: "Kaunas University of Technology",
    description: "Connect with fellow students and professionals.",
    contact: "+370 567 8901",
    address: "Gedimino g. 50, Kaunas",
  },
  {
    id: 6,
    title: "Sports Trivia Night",
    cafe: "Champions Corner",
    image: "/sports-trivia-night-at-cafe.jpg",
    date: "Monday, 7:30 PM",
    tags: ["Sports", "Entertainment"],
    attendees: 14,
    maxAttendees: 20,
    university: "Vytautas Magnus University",
    description: "Test your sports knowledge in this fun trivia competition.",
    contact: "+370 678 9012",
    address: "Laisvės al. 53, Kaunas",
  },
]

interface EventsGridProps {
  filters: EventFilters
}

export function EventsGrid({ filters }: EventsGridProps) {
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<(typeof allEvents)[0] | null>(null)
  const [filteredEvents, setFilteredEvents] = useState(allEvents)

  useEffect(() => {
    // Simulate loading
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [filters])

  useEffect(() => {
    let filtered = allEvents

    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          event.cafe.toLowerCase().includes(filters.search.toLowerCase()) ||
          event.tags.some((tag) => tag.toLowerCase().includes(filters.search.toLowerCase())),
      )
    }

    // Filter by universities
    if (filters.universities.length > 0 && !filters.universities.includes("All Universities")) {
      filtered = filtered.filter((event) => filters.universities.includes(event.university))
    }

    // Filter by activity types
    if (filters.activityTypes.length > 0) {
      filtered = filtered.filter((event) => event.tags.some((tag) => filters.activityTypes.includes(tag)))
    }

    setFilteredEvents(filtered)
  }, [filters])

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <EventSkeletonCard key={index} />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <EventCard event={event} onBookClick={() => setSelectedEvent(event)} />
          </motion.div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
          <h3 className="text-2xl font-serif font-semibold gradient-text mb-4">No Events Found</h3>
          <p className="text-muted-foreground">Try adjusting your filters to find more events.</p>
        </motion.div>
      )}

      {selectedEvent && (
        <BookingModal event={selectedEvent} isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </>
  )
}
