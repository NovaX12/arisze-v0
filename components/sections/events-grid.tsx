"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { EventCard } from "@/components/ui/event-card"
import { EventSkeletonCard } from "@/components/ui/event-skeleton-card"
import { BookingModal } from "@/components/ui/booking-modal"
import { useEvents } from "@/hooks/use-api"
import type { EventFilters } from "@/components/sections/events-filters"

// System events (hardcoded for demo purposes)
const systemEvents = [
  {
    _id: "507f1f77bcf86cd799439011",
    title: "Board Game Night",
    venue: "Community Center",
    image: "/cozy-cafe-with-board-games.jpg",
    date: "2025-01-20",
    time: "19:00",
    tags: ["Board Games", "Social"],
    attendees: 12,
    maxAttendees: 20,
    description: "Join us for an evening of strategic fun and social connection!",
    contact: "+370 123 4567",
    address: "Studentų g. 50, Kaunas",
    eventType: "social"
  },
  {
    _id: "507f1f77bcf86cd799439012",
    title: "Study Group Session",
    venue: "Academic Grounds",
    image: "/modern-study-cafe-with-students.jpg",
    date: "2025-01-21",
    time: "14:00",
    tags: ["Study Group", "Academic"],
    attendees: 8,
    maxAttendees: 15,
    description: "Collaborative study session for upcoming exams.",
    contact: "+370 234 5678",
    address: "V. Putvinskio g. 23, Kaunas",
    eventType: "academic"
  },
  {
    _id: "507f1f77bcf86cd799439013",
    title: "Live Acoustic Music",
    venue: "Melody Lounge",
    image: "/intimate-cafe-with-acoustic-guitar-performance.jpg",
    date: "2025-01-24",
    time: "20:00",
    tags: ["Live Music", "Entertainment"],
    attendees: 25,
    maxAttendees: 30,
    description: "Enjoy live acoustic performances by local student artists.",
    contact: "+370 345 6789",
    address: "A. Mickevičiaus g. 9, Kaunas",
    eventType: "entertainment"
  },
  {
    _id: "507f1f77bcf86cd799439014",
    title: "Art & Coffee Workshop",
    venue: "Creative Beans",
    image: "/artistic-cafe-with-painting-supplies.jpg",
    date: "2025-01-25",
    time: "10:00",
    tags: ["Art Workshop", "Social"],
    attendees: 6,
    maxAttendees: 12,
    description: "Express your creativity while enjoying premium coffee.",
    contact: "+370 456 7890",
    address: "Pramonės pr. 20, Kaunas",
    eventType: "workshop"
  },
  {
    _id: "507f1f77bcf86cd799439015",
    title: "Networking Mixer",
    venue: "Business Hub",
    image: "/modern-business-networking-event.jpg",
    date: "2025-01-26",
    time: "18:00",
    tags: ["Networking", "Social"],
    attendees: 18,
    maxAttendees: 25,
    description: "Connect with fellow students and professionals.",
    contact: "+370 567 8901",
    address: "Gedimino g. 50, Kaunas",
    eventType: "networking"
  },
  {
    _id: "507f1f77bcf86cd799439016",
    title: "Sports Trivia Night",
    venue: "Champions Corner",
    image: "/sports-trivia-night-at-cafe.jpg",
    date: "2025-01-27",
    time: "19:30",
    tags: ["Sports", "Entertainment"],
    attendees: 14,
    maxAttendees: 20,
    description: "Test your sports knowledge in this fun trivia competition.",
    contact: "+370 678 9012",
    address: "Laisvės al. 53, Kaunas",
    eventType: "entertainment"
  },
]

interface EventsGridProps {
  filters: EventFilters
}

export function EventsGrid({ filters }: EventsGridProps) {
  const { data: userGeneratedEvents, loading: apiLoading } = useEvents()
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [filteredEvents, setFilteredEvents] = useState<any[]>([])
  const [allEvents, setAllEvents] = useState<any[]>([])

  // Combine system events with user-generated events from API
  useEffect(() => {
    const combinedEvents = [
      ...systemEvents,
      ...(userGeneratedEvents || []).map((event: any) => ({
        id: event._id,
        title: event.title,
        venue: event.venue || event.cafe || "TBA",
        image: event.image || '/default-event-image.jpg',
        date: event.date,
        tags: event.tags || [],
        attendees: event.attendees || 0,
        maxAttendees: event.maxAttendees || 0,
        description: event.description,
        contact: event.contact,
        address: event.address,
        eventType: 'user-generated'
      }))
    ]
    setAllEvents(combinedEvents)
  }, [userGeneratedEvents])

  useEffect(() => {
    let filtered = allEvents

    // Filter by search term
    if (filters.search) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          event.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          event.venue.toLowerCase().includes(filters.search.toLowerCase()) ||
          (event.tags && event.tags.some((tag: string) => tag.toLowerCase().includes(filters.search.toLowerCase()))),
      )
    }

    // Filter by activity types
    if (filters.activityTypes.length > 0) {
      filtered = filtered.filter((event) => event.tags && event.tags.some((tag: string) => filters.activityTypes.includes(tag)))
    }

    setFilteredEvents(filtered)
  }, [filters, allEvents])

  if (apiLoading || allEvents.length === 0) {
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
