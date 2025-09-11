"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Users, Mail, Phone, University, Calendar, Clock, MapPin, User } from "lucide-react"
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
  cafe: string
  image: string
  date: string
  time?: string
  tags: string[]
  attendees: number
  maxAttendees: number
  university: string
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
    userUniversity?: string
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

  useEffect(() => {
    if (isOpen && event?._id) {
      fetchParticipants()
    }
  }, [isOpen, event?._id])

  const fetchParticipants = async () => {
    if (!event?._id) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/events/${event._id}/participants`)
      if (response.ok) {
        const data = await response.json()
        setParticipants(data.participants || [])
      } else {
        toast.error("Failed to load participants")
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
      toast.error("Failed to load participants")
    } finally {
      setLoading(false)
    }
  }

  const getTotalAttendees = () => {
    return participants.reduce((total, participant) => {
      return total + participant.groupSize + (participant.hasGuest ? 1 : 0)
    }, 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Event Participants
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Summary */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {event.time || '18:00'}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.cafe}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{getTotalAttendees()}</div>
                <div className="text-sm text-muted-foreground">Total Attendees</div>
              </div>
            </div>
          </Card>

          {/* Participants List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : participants.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Participants Yet</h3>
                <p className="text-muted-foreground">
                  This event doesn't have any registered participants yet.
                </p>
              </Card>
            ) : (
              <div className="grid gap-3">
                {participants.map((participant, index) => (
                  <motion.div
                    key={participant._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {participant.userName?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{participant.userName}</h4>
                            <Badge 
                              variant={participant.status === 'attended' ? 'default' : 
                                      participant.status === 'no-show' ? 'destructive' : 'secondary'}
                            >
                              {participant.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {participant.userEmail}
                            </div>
                            
                            {participant.userPhone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {participant.userPhone}
                              </div>
                            )}
                            
                            {participant.userUniversity && (
                              <div className="flex items-center gap-1">
                                <University className="h-3 w-3" />
                                {participant.userUniversity}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Group size: {participant.groupSize}
                            </div>
                          </div>
                          
                          {participant.hasGuest && participant.guestInfo && (
                            <div className="mt-2 p-2 bg-muted/50 rounded-md">
                              <div className="text-xs font-medium text-muted-foreground mb-1">Guest Information:</div>
                              <div className="text-sm">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {participant.guestInfo.name}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {participant.guestInfo.email}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground">
                            Joined: {new Date(participant.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Summary Stats */}
          {participants.length > 0 && (
            <Card className="p-4 bg-muted/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{participants.length}</div>
                  <div className="text-sm text-muted-foreground">Registered</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {participants.filter(p => p.status === 'attended').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Attended</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {participants.filter(p => p.hasGuest).length}
                  </div>
                  <div className="text-sm text-muted-foreground">With Guests</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{getTotalAttendees()}</div>
                  <div className="text-sm text-muted-foreground">Total People</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}