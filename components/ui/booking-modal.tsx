

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, Clock, MapPin, Phone, Loader2, CheckCircle, Users, User } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Image from "next/image"

interface Event {
  _id?: string
  id?: number
  title: string
  venue?: string
  cafe?: string
  image?: string
  date: string
  time?: string
  tags: string[]
  attendees: number
  maxAttendees?: number
  description: string
  contact: string
  address: string
  eventType?: string
}

interface GuestInfo {
  name: string
  email: string
  phone?: string
  university?: string
}

interface BookingModalProps {
  event: Event
  isOpen: boolean
  onClose: () => void
}

const universities = [
  "Vilnius University",
  "Kaunas University of Technology", 
  "Vytautas Magnus University",
  "Lithuanian University of Health Sciences",
  "Vilnius Gediminas Technical University",
  "ISM University of Management and Economics",
  "Lithuanian Academy of Music and Theatre",
  "Vilnius Academy of Arts",
  "Other"
]

export function BookingModal({ event, isOpen, onClose }: BookingModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [name, setName] = useState("")
  const [userPhone, setUserPhone] = useState("")
  const [university, setUniversity] = useState("")
  const [hasGuest, setHasGuest] = useState(false)
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({ name: "", email: "" })
  const [specialRequirements, setSpecialRequirements] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [hasBooked, setHasBooked] = useState(false)
  const [checkingBooking, setCheckingBooking] = useState(true)

  // Pre-fill user information from session
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "")
    }
  }, [session])

  // Check if user has already booked this event
  useEffect(() => {
    const checkBookingStatus = async () => {
      if (!session?.user?.id || !event._id) {
        setCheckingBooking(false)
        return
      }

      try {
        const response = await fetch(`/api/events/${event._id}/book`)
        if (response.ok) {
          const result = await response.json()
          setHasBooked(result.hasBooked)
        }
      } catch (error) {
        console.error('Error checking booking status:', error)
      } finally {
        setCheckingBooking(false)
      }
    }

    if (isOpen) {
      checkBookingStatus()
    }
  }, [session, event._id, isOpen])

  const handleBooking = async () => {
    if (!session?.user?.email) {
      toast.error("❌ Authentication required", {
        description: "Please sign in to book events.",
      })
      return
    }

    if (!userPhone.trim()) {
      toast.error("❌ Phone number required", {
        description: "Please enter your phone number.",
      })
      return
    }

    if (!university.trim()) {
      toast.error("❌ University required", {
        description: "Please select your university.",
      })
      return
    }

    if (hasGuest && (!guestInfo.name.trim() || !guestInfo.email.trim())) {
      toast.error("❌ Guest information required", {
        description: "Please provide guest name and email.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const eventId = event._id || event.id
      
      if (!eventId) {
        toast.error("❌ Invalid event", {
          description: "Event ID is missing. Please try again.",
        })
        return
      }

      const response = await fetch(`/api/events/${eventId}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPhone: userPhone,
          university,
          specialRequirements,
          hasGuest,
          ...(hasGuest && { guestInfo }),
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setBookingSuccess(true)
        setHasBooked(true)
        toast.success("✅ Event booked successfully!", {
          description: result.message || `Successfully booked ${event.title}`,
          duration: 4000,
        })
        
        // Close modal after showing success for 2 seconds
        setTimeout(() => {
          setBookingSuccess(false)
          onClose()
          // Reset form
          setUserPhone("")
          setUniversity("")
          setHasGuest(false)
          setGuestInfo({ name: "", email: "" })
          setSpecialRequirements("")
        }, 2000)
      } else {
        console.error('Booking failed:', result.error)
        toast.error("❌ Booking failed", {
          description: result.error || 'Failed to book event. Please try again.',
        })
      }
    } catch (error) {
      console.error('Error booking event:', error)
      toast.error("❌ Booking error", {
        description: 'Error booking event. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEventFull = event.attendees >= (event.maxAttendees || 50)

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl p-0 glassmorphism border-0 overflow-hidden">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative"
            >
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Event Header */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">{event.title}</h2>
                  <div className="flex items-center gap-4 text-sm opacity-90">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.venue || event.cafe || "TBA"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    {event.time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {event.time}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Event Details */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-400" />
                      <span className="text-sm text-gray-300">
                        {event.attendees} / {event.maxAttendees || 50} attendees
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {event.tags && event.tags.length > 0 ? event.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-purple-500/20 text-purple-300">
                          {tag}
                        </Badge>
                      )) : (
                        <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">
                          No tags
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4">{event.description}</p>
                  <div className="text-sm text-gray-400">
                    <p><strong>Address:</strong> {event.address}</p>
                    <p><strong>Contact:</strong> {event.contact}</p>
                  </div>
                </div>

                {/* Booking Status */}
                {checkingBooking ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                    <span className="ml-2 text-gray-300">Checking booking status...</span>
                  </div>
                ) : bookingSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-400 mb-2">Booking Confirmed!</h3>
                    <p className="text-gray-300">You've successfully booked {event.title}</p>
                  </div>
                ) : hasBooked ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-blue-400 mb-2">Already Booked</h3>
                    <p className="text-gray-300">You have already booked this event</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone" className="text-gray-300">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+370 600 12345"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                            className="bg-black/20 border-gray-600 text-white placeholder-gray-400"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="university" className="text-gray-300">University *</Label>
                          <Select value={university} onValueChange={setUniversity}>
                            <SelectTrigger className="bg-black/20 border-gray-600 text-white">
                              <SelectValue placeholder="Select your university" />
                            </SelectTrigger>
                            <SelectContent>
                              {universities.map((uni) => (
                                <SelectItem key={uni} value={uni}>
                                  {uni}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="requirements" className="text-gray-300">Special Requirements</Label>
                        <Textarea
                          id="requirements"
                          placeholder="Any dietary restrictions, accessibility needs, or other requirements..."
                          value={specialRequirements}
                          onChange={(e) => setSpecialRequirements(e.target.value)}
                          className="bg-black/20 border-gray-600 text-white placeholder-gray-400"
                          rows={3}
                        />
                      </div>

                      {/* Guest Information Toggle */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasGuest"
                          checked={hasGuest}
                          onCheckedChange={(checked) => setHasGuest(checked === true)}
                        />
                        <Label htmlFor="hasGuest" className="text-gray-300">
                          I'm bringing a guest
                        </Label>
                      </div>
                    </div>

                    {/* Guest Information */}
                    {hasGuest && (
                      <div className="space-y-4 border-t border-gray-600 pt-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Guest Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="guestName" className="text-gray-300">Guest Name *</Label>
                            <Input
                              id="guestName"
                              placeholder="Guest's full name"
                              value={guestInfo.name}
                              onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                              className="bg-black/20 border-gray-600 text-white placeholder-gray-400"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="guestEmail" className="text-gray-300">Guest Email *</Label>
                            <Input
                              id="guestEmail"
                              type="email"
                              placeholder="guest@example.com"
                              value={guestInfo.email}
                              onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                              className="bg-black/20 border-gray-600 text-white placeholder-gray-400"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="guestPhone" className="text-gray-300">Guest Phone</Label>
                            <Input
                              id="guestPhone"
                              type="tel"
                              placeholder="+370 600 12345"
                              value={guestInfo.phone || ""}
                              onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                              className="bg-black/20 border-gray-600 text-white placeholder-gray-400"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="guestUniversity" className="text-gray-300">Guest University</Label>
                            <Select 
                              value={guestInfo.university || ""} 
                              onValueChange={(value) => setGuestInfo({ ...guestInfo, university: value })}
                            >
                              <SelectTrigger className="bg-black/20 border-gray-600 text-white">
                                <SelectValue placeholder="Select guest's university" />
                              </SelectTrigger>
                              <SelectContent>
                                {universities.map((uni) => (
                                  <SelectItem key={uni} value={uni}>
                                    {uni}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6 border-t border-gray-600">
                      <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleBooking}
                        disabled={isSubmitting || isEventFull}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Booking...
                          </>
                        ) : isEventFull ? (
                          "Join Waitlist"
                        ) : (
                          "Book Event"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
