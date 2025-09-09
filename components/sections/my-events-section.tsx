"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Users, Eye, X, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface Booking {
  _id: string
  venueId: string
  venueName: string
  date: string
  time: string
  groupSize: number
  status: string
  createdAt: string
}

export function MyEventsSection() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  // Fetch user's bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!session?.user?.id) return
      
      try {
        const response = await fetch('/api/bookings')
        if (response.ok) {
          const result = await response.json()
          setBookings(result.bookings || [])
        } else {
          console.error('Failed to fetch bookings')
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [session])

  // Cancel a booking
  const handleCancelBooking = async (bookingId: string) => {
    setCancelling(bookingId)
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      })

      if (response.ok) {
        // Remove the cancelled booking from the list
        setBookings(bookings.filter(booking => booking._id !== bookingId))
        toast.success("✅ Booking cancelled successfully!", {
          description: "The event has been removed from your schedule.",
          duration: 3000,
        })
      } else {
        const result = await response.json()
        console.error('Failed to cancel booking:', result.error)
        toast.error("❌ Cancellation failed", {
          description: result.error || 'Failed to cancel booking. Please try again.',
        })
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error("❌ Cancellation error", {
        description: 'Error cancelling booking. Please try again.',
      })
    } finally {
      setCancelling(null)
    }
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
  const upcomingBookings = bookings.filter(booking => new Date(booking.date) >= now)
  const pastBookings = bookings.filter(booking => new Date(booking.date) < now)

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

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glassmorphism">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            Upcoming Events ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-accent data-[state=active]:text-white">
            Past Events ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length === 0 ? (
            <Card className="p-8 text-center glassmorphism border-0">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Upcoming Events</h3>
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
                          <h3 className="text-xl font-semibold">{booking.venueName}</h3>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(booking.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{booking.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{booking.groupSize} {booking.groupSize === 1 ? 'person' : 'people'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={cancelling === booking._id}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          {cancelling === booking._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
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

        <TabsContent value="past" className="space-y-4">
          {pastBookings.length === 0 ? (
            <Card className="p-8 text-center glassmorphism border-0">
              <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Past Events</h3>
              <p className="text-muted-foreground">
                Your event history will appear here after you attend some events.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastBookings.map((booking, index) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 glassmorphism border-0 opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold">{booking.venueName}</h3>
                          <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">
                            completed
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(booking.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{booking.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{booking.groupSize} {booking.groupSize === 1 ? 'person' : 'people'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}