"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Users, Mail, Phone, Calendar, Clock, MapPin, User, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface Event {
  _id?: string
  id?: number
  title: string
  venue?: string
  cafe?: string
  image: string
  date: string
  time?: string
  tags: string[]
  attendees: number
  maxAttendees: number
  description: string
  contact: string
  address: string
  eventType?: string
  createdByName?: string
  participants: Array<{
    _id?: string
    userId: string
    userName: string
    userEmail: string
    userPhone?: string
    groupSize: number
    hasGuest: boolean
    guestInfo?: {
      name: string
      email: string
    }
    joinedAt: Date
    status: 'registered' | 'attended' | 'no-show'
  }>
}

interface ParticipantDetailsModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
}

export function ParticipantDetailsModal({ event, isOpen, onClose }: ParticipantDetailsModalProps) {
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch participants data
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!event?._id || !isOpen) return

      setLoading(true)
      try {
        const response = await fetch(`/api/events/${event._id}/participants`)
        if (response.ok) {
          const data = await response.json()
          setParticipants(data.participants || [])
          setLastUpdated(new Date())
        } else {
          console.error('Failed to fetch participants')
          toast.error('Failed to load participants')
        }
      } catch (error) {
        console.error('Error fetching participants:', error)
        toast.error('Error loading participants')
      } finally {
        setLoading(false)
      }
    }

    fetchParticipants()

    // Set up auto-refresh every 30 seconds when modal is open
    if (isOpen && event?._id) {
      intervalRef.current = setInterval(fetchParticipants, 30000)
    }

    // Cleanup interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [event?._id, isOpen])

  const refreshParticipants = async () => {
    if (!event?._id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/events/${event._id}/participants`)
      if (response.ok) {
        const data = await response.json()
        setParticipants(data.participants || [])
        setLastUpdated(new Date())
        toast.success('Participants refreshed')
      } else {
        toast.error('Failed to refresh participants')
      }
    } catch (error) {
      console.error('Error refreshing participants:', error)
      toast.error('Error refreshing participants')
    } finally {
      setLoading(false)
    }
  }

  if (!event) return null

  const totalAttendees = participants.reduce((total, participant) => {
    return total + 1 + (participant.hasGuest ? 1 : 0)
  }, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden glassmorphism border-0">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <DialogHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl font-serif gradient-text">
                      Event Participants
                    </DialogTitle>
                    <p className="text-muted-foreground mt-1">{event.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={refreshParticipants}
                      disabled={loading}
                      className="rounded-full hover:glow-effect transition-all duration-300"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="rounded-full hover:glow-effect transition-all duration-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              {/* Event Summary */}
              <Card className="p-4 glassmorphism border-0 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <span>{event.time || 'Time TBA'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span>{event.venue || event.cafe || 'Venue TBA'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    <span>{totalAttendees} / {event.maxAttendees} attendees</span>
                  </div>
                </div>
              </Card>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 text-center glassmorphism border-0">
                  <div className="text-2xl font-bold text-accent">{participants.length}</div>
                  <div className="text-sm text-muted-foreground">Registrations</div>
                </Card>
                <Card className="p-4 text-center glassmorphism border-0">
                  <div className="text-2xl font-bold text-accent">{totalAttendees}</div>
                  <div className="text-sm text-muted-foreground">Total Attendees</div>
                </Card>
                <Card className="p-4 text-center glassmorphism border-0">
                  <div className="text-2xl font-bold text-accent">
                    {participants.filter(p => p.hasGuest).length}
                  </div>
                  <div className="text-sm text-muted-foreground">With Guests</div>
                </Card>
                <Card className="p-4 text-center glassmorphism border-0">
                  <div className="text-2xl font-bold text-accent">
                    {Math.round((totalAttendees / event.maxAttendees) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Capacity</div>
                </Card>
              </div>

              {/* Last Updated */}
              {lastUpdated && (
                <div className="text-xs text-muted-foreground mb-4 text-center">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}

              {/* Participants List */}
              <div className="max-h-96 overflow-y-auto space-y-3">
                {loading && participants.length === 0 ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-accent" />
                    <p className="text-muted-foreground">Loading participants...</p>
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Participants Yet</h3>
                    <p className="text-muted-foreground">
                      Participants will appear here once they register for the event.
                    </p>
                  </div>
                ) : (
                  participants.map((participant, index) => (
                    <motion.div
                      key={participant._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4 glassmorphism border-0 hover:glow-effect transition-all duration-300">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white">
                                {participant.userName
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{participant.userName}</h4>
                                <Badge 
                                  variant={participant.status === 'registered' ? 'default' : 
                                          participant.status === 'attended' ? 'secondary' : 'destructive'}
                                  className="text-xs"
                                >
                                  {participant.status}
                                </Badge>
                                {participant.hasGuest && (
                                  <Badge variant="outline" className="text-xs">
                                    +1 Guest
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3" />
                                  <span>{participant.userEmail}</span>
                                </div>
                                {participant.userPhone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3" />
                                    <span>{participant.userPhone}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <User className="h-3 w-3" />
                                  <span>Joined {new Date(participant.joinedAt).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {/* Guest Information */}
                              {participant.hasGuest && participant.guestInfo && (
                                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                  <div className="text-sm">
                                    <div className="font-medium text-foreground mb-1">
                                      Guest: {participant.guestInfo.name}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {participant.guestInfo.email}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}