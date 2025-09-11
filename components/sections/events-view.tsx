"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin, Clock, Users, Search, Filter, Plus } from "lucide-react"
import { useEvents } from "@/hooks/use-api"
import { CreateEventModal } from '@/components/ui/create-event-modal'
import { BookingModal } from '@/components/ui/booking-modal'

interface Event {
  _id: string
  title: string
  description: string
  date: string
  time: string
  cafe: string
  address: string
  university: string
  tags: string[]
  attendees: number
  maxAttendees: number
  image: string
  contact: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface DisplayEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  maxParticipants: number
  currentParticipants: number
  image: string
}

export function EventsView() {
  const { data: session } = useSession()
  const { data: apiEvents, loading: apiLoading, error } = useEvents(refreshKey)
  const [filteredEvents, setFilteredEvents] = useState<DisplayEvent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [refreshKey, setRefreshKey] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  const categories = ["All", "Board Games", "Study", "Live Music", "Art", "Workshop", "Social", "Academic", "Entertainment"]

  // Convert MongoDB events to display format
  const convertToDisplayEvents = useCallback((events: Event[]): DisplayEvent[] => {
    if (!events || !Array.isArray(events)) return []
    
    return events.map(event => ({
      id: event._id || '',
      title: event.title || '',
      description: event.description || '',
      date: event.date || new Date().toISOString(),
      time: event.time || '',
      location: `${event.cafe || ''} - ${event.address || ''}`,
      category: (event.tags && event.tags[0]) || "General",
      maxParticipants: event.maxAttendees || 0,
      currentParticipants: event.attendees || 0,
      image: event.image || ''
    }))
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (apiEvents && mounted) {
      const displayEvents = convertToDisplayEvents(apiEvents)
      setFilteredEvents(displayEvents)
    }
  }, [apiEvents, mounted])

  useEffect(() => {
    if (!mounted || !apiEvents) return
    
    let displayEvents = convertToDisplayEvents(apiEvents)

    if (searchTerm) {
      displayEvents = displayEvents.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== "All") {
      displayEvents = displayEvents.filter(event => event.category === selectedCategory)
    }

    setFilteredEvents(displayEvents)
  }, [searchTerm, selectedCategory, apiEvents, mounted, convertToDisplayEvents])

  const handleBookEvent = (eventId: string) => {
    // Find the event from apiEvents
    const event = apiEvents?.find(e => e._id === eventId || e.id?.toString() === eventId)
    if (event) {
      setSelectedEvent(event)
      setShowBookingModal(true)
    }
  }

  if (!mounted || apiLoading) {
    return (
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glassmorphism rounded-2xl p-6 animate-pulse">
              <div className="h-48 bg-muted rounded-lg mb-4"></div>
              <div className="h-6 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-1"></div>
              <div className="h-4 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <p className="text-red-500">Error loading events: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with Create Event Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Discover Events</h2>
          <p className="text-muted-foreground">Find and join amazing events in your area</p>
        </div>
        {session && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-primary to-secondary hover:scale-105 hover:glow-effect transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-full border-accent/30 focus:border-accent focus:glow-effect transition-all duration-300"
            data-testid="search-input"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-2 rounded-full border border-accent/30 bg-background text-foreground focus:border-accent focus:glow-effect transition-all duration-300 appearance-none"
            data-testid="filter-dropdown"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="events-list">
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="glassmorphism border-0 overflow-hidden hover:glow-effect transition-all duration-300" data-testid="event-card">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                  {event.image ? (
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Calendar className="h-16 w-16 text-accent/50" />
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-medium rounded-full border border-accent/30">
                    {event.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-serif font-bold gradient-text mb-2" data-testid="event-title">{event.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{event.currentParticipants}/{event.maxParticipants} participants</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleBookEvent(event.id)}
                  disabled={event.currentParticipants >= event.maxParticipants}
                  className="w-full rounded-full bg-gradient-to-r from-primary to-secondary hover:scale-105 hover:glow-effect transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="book-event-button"
                >
                  {event.currentParticipants >= event.maxParticipants ? 'Fully Booked' : 'Book Event'}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found matching your criteria.</p>
        </div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={() => {
          // Refresh events list after creation
          setRefreshKey(prev => prev + 1)
          setShowCreateModal(false)
        }}
      />

      {/* Booking Modal */}
      {selectedEvent && (
        <BookingModal
          event={selectedEvent}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false)
            setSelectedEvent(null)
          }}
        />
      )}
    </div>
  )
}