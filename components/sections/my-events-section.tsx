"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Users, Eye, X, Loader2, UserPlus, Mail, Phone, University } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreateEventModal } from "@/components/ui/create-event-modal"
import { ParticipantDetailsModal } from "@/components/ui/participant-details-modal"
import { toast } from "sonner"

interface Booking {
  _id: string
  eventId: string
  eventTitle: string
  eventCafe: string
  eventDate: string
  eventTime: string
  eventAddress: string
  userPhone: string
  university: string
  hasGuest: boolean
  guestInfo: any
  bookedAt: string
  status: string
}

export function MyEventsSection() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [createdEvents, setCreatedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!session?.user?.id) {
        setLoading(false)
        return
      }

      try {
        // Fetch booked events
        const bookingsResponse = await fetch('/api/user/bookings')
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json()
          setBookings(bookingsData.bookings || [])
        }

        // Fetch created events
        const createdResponse = await fetch('/api/user/created-events')
        if (createdResponse.ok) {
          const createdData = await createdResponse.json()
          setCreatedEvents(createdData.events || [])
        }
      } catch (error) {
        console.error('Error fetching user events:', error)
        toast.error('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchUserEvents()
  }, [session])

  const cancelBooking = async (booking: Booking) => {
    try {
      const response = await fetch(`/api/events/${booking.eventId}/book`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBookings(bookings.filter(b => b._id !== booking._id))
        toast.success('Booking cancelled successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to cancel booking')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Error cancelling booking')
    }
  }

  const viewParticipants = (event: CreatedEvent) => {
    setSelectedEvent(event)
    setShowParticipants(true)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Separate upcoming and past events
  const now = new Date()
  const upcomingBookings = bookings.filter(booking => new Date(booking.eventDate) >= now)
  const pastBookings = bookings.filter(booking => new Date(booking.eventDate) < now)
  const upcomingCreated = createdEvents.filter(event => new Date(event.date) >= now)
  const pastCreated = createdEvents.filter(event => new Date(event.date) < now)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Loading your events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-serif font-bold gradient-text mb-2"
        >
          My Events
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Manage your event bookings and view your event history
        </motion.p>
      </div>

      <Tabs defaultValue="booked" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glassmorphism">
          <TabsTrigger value="booked" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            Booked Events ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="created" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            My Created Events ({upcomingCreated.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            Past Events ({pastBookings.length + pastCreated.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="booked" className="space-y-4">
          {upcomingBookings.length === 0 ? (
            <Card className="p-8 text-center glassmorphism border-0">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Upcoming Bookings</h3>
              <p className="text-muted-foreground mb-4">
                You haven't booked any events yet. Start exploring events to make your first booking!
              </p>
              <Button asChild>
                <a href="/events">Browse Events</a>
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingBookings.map((booking, index) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 glassmorphism border-0 hover:glow-effect transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold">{booking.eventTitle}</h3>
                          <Badge className="bg-accent/20 text-accent border-accent/30">
                            {booking.status}
                          </Badge>
                          {booking.hasGuest && (
                            <Badge variant="outline">
                              With Guest
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(booking.eventDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{booking.eventTime || 'Time TBA'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{booking.eventCafe}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <div>University: {booking.university}</div>
                          <div>Phone: {booking.userPhone}</div>
                          {booking.hasGuest && booking.guestInfo && (
                            <div className="mt-2 p-2 bg-muted/50 rounded">
                              Guest: {booking.guestInfo.name} ({booking.guestInfo.email})
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="rounded-full"
                          onClick={() => cancelBooking(booking)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="created" className="space-y-4">
          {upcomingCreated.length === 0 ? (
            <Card className="p-8 text-center glassmorphism border-0">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Created Events</h3>
              <p className="text-muted-foreground mb-4">
                You haven't created any events yet. Create your first event to bring people together!
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                Create Event
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingCreated.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 glassmorphism border-0 hover:glow-effect transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold">{event.title}</h3>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Created by you
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{event.time || 'Time TBA'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.cafe}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{event.participants.reduce((total, p) => total + 1 + (p.hasGuest ? 1 : 0), 0)} / {event.maxAttendees} participants</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => viewParticipants(event)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          View Participants ({event.participants.length})
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.length === 0 && pastCreated.length === 0 ? (
            <Card className="p-8 text-center glassmorphism border-0">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Past Events</h3>
              <p className="text-muted-foreground">
                Your event history will appear here once you start attending or creating events.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {/* Past Bookings */}
              {pastBookings.map((booking, index) => (
                <motion.div
                  key={`booking-${booking._id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 glassmorphism border-0 opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold">{booking.eventTitle}</h3>
                          <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">
                            attended
                          </Badge>
                          {booking.hasGuest && (
                            <Badge variant="outline" className="opacity-60">
                              With Guest
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(booking.eventDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{booking.eventTime || 'Time TBA'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{booking.eventCafe}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
              
              {/* Past Created Events */}
              {pastCreated.map((event, index) => (
                <motion.div
                  key={`created-${event._id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (pastBookings.length + index) * 0.1 }}
                >
                  <Card className="p-6 glassmorphism border-0 opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold">{event.title}</h3>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            hosted by you
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{event.time || 'Time TBA'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{event.participants.reduce((total, p) => total + 1 + (p.hasGuest ? 1 : 0), 0)} participants attended</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full opacity-60"
                          onClick={() => viewParticipants(event)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          View Participants
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <ParticipantDetailsModal
        event={selectedEvent}
        isOpen={showParticipants}
        onClose={() => {
          setShowParticipants(false)
          setSelectedEvent(null)
        }}
      />
      
      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={() => {
          // Refresh events list after creation
          window.location.reload()
        }}
      />
    </div>
  )
}