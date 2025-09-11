"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, Clock, MapPin, Phone, Loader2, CheckCircle, Users, User } from "lucide-react"
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
}

interface GuestInfo {
  name: string
  email: string
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

interface BookingModalProps {
  event: Event
  isOpen: boolean
  onClose: () => void
}

const timeSlots = ["18:00", "19:00", "20:00", "21:00"]
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function BookingModal({ event, isOpen, onClose }: BookingModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [name, setName] = useState("")
  const [userPhone, setUserPhone] = useState("")
  const [university, setUniversity] = useState("")
  const [hasGuest, setHasGuest] = useState(false)
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({ name: "", email: "" })
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

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handleBooking = async () => {
    // Check if user is authenticated
    if (!session?.user?.id) {
      router.push('/login?callbackUrl=/events')
      return
    }

    // Validate required fields
    if (!userPhone || !university) {
      toast.error("❌ Missing Information", {
        description: 'Please provide your phone number and university.',
      })
      return
    }

    // Validate guest information if bringing a guest
    if (hasGuest && (!guestInfo.name || !guestInfo.email)) {
      toast.error("❌ Guest Information Required", {
        description: 'Please provide guest name and email.',
      })
      return
    }

    // Validate phone number format
    const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,15}$/
    if (!phoneRegex.test(userPhone)) {
      toast.error("❌ Invalid Phone Number", {
        description: 'Please provide a valid phone number.',
      })
      return
    }

    // Validate guest email if provided
    if (hasGuest && guestInfo.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(guestInfo.email)) {
        toast.error("❌ Invalid Guest Email", {
          description: 'Please provide a valid guest email address.',
        })
        return
      }
    }

    setIsSubmitting(true)

    try {
      const eventId = event._id || event.id?.toString()
      if (!eventId) {
        throw new Error('Event ID not found')
      }

      const response = await fetch(`/api/events/${eventId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPhone,
          university,
          hasGuest,
          guestInfo: hasGuest ? guestInfo : null,
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

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const isToday = date.toDateString() === currentDate.toDateString()
      const isPast = date < currentDate
      const isSelected = selectedDate?.toDateString() === date.toDateString()

      days.push(
        <button
          key={day}
          onClick={() => !isPast && setSelectedDate(date)}
          disabled={isPast}
          className={`h-10 w-10 rounded-full text-sm font-medium transition-all duration-200 ${
            isPast
              ? "text-muted-foreground cursor-not-allowed"
              : isSelected
                ? "bg-gradient-to-r from-primary to-secondary text-white glow-effect"
                : isToday
                  ? "bg-accent/20 text-accent border border-accent"
                  : "hover:bg-accent/10 hover:text-accent"
          }`}
        >
          {day}
        </button>,
      )
    }

    return days
  }

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
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Top Section */}
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Event Image */}
                <div className="relative aspect-video rounded-2xl overflow-hidden">
                  <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                </div>

                {/* Event Details */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-serif font-bold gradient-text mb-2">{event.title}</h2>
                    <p className="text-muted-foreground mb-4">{event.description}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-accent" />
                      <div>
                        <p className="font-medium">{event.cafe}</p>
                        <p className="text-sm text-muted-foreground">{event.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-accent" />
                      <p className="text-sm">{event.contact}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-accent" />
                      <p className="text-sm">{event.date}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {event.tags && event.tags.length > 0 ? event.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-accent/30 text-accent">
                        {tag}
                      </Badge>
                    )) : (
                      <Badge variant="outline" className="border-accent/30 text-accent">
                        General Event
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="grid md:grid-cols-2 gap-6 p-6 pt-0">
                {/* Calendar */}
                <div>
                  <h3 className="text-lg font-serif font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-accent" />
                    Select Date
                  </h3>
                  <div className="glassmorphism rounded-2xl p-4">
                    <div className="text-center mb-4">
                      <h4 className="font-semibold">
                        {months[currentMonth]} {currentYear}
                      </h4>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                      <div>Sun</div>
                      <div>Mon</div>
                      <div>Tue</div>
                      <div>Wed</div>
                      <div>Thu</div>
                      <div>Fri</div>
                      <div>Sat</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
                  </div>
                </div>

                {/* Time Slots & Booking Form */}
                <div className="space-y-6">
                  {/* Time Slots */}
                  <div>
                    <h3 className="text-lg font-serif font-semibold mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-accent" />
                      Available Times
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className={`rounded-full transition-all duration-300 ${
                            selectedTime === time
                              ? "bg-gradient-to-r from-primary to-secondary glow-effect"
                              : "border-accent/30 hover:border-accent hover:glow-effect"
                          }`}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Booking Form */}
                  <div className="space-y-4">
                    {checkingBooking ? (
                      <div className="text-center py-4">
                        <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
                        <p className="text-sm text-muted-foreground">Checking booking status...</p>
                      </div>
                    ) : hasBooked ? (
                      <div className="text-center py-6 space-y-3">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                        <h3 className="text-lg font-semibold text-green-500">Already Booked!</h3>
                        <p className="text-sm text-muted-foreground">
                          You have already booked this event. Check your dashboard for details.
                        </p>
                        <Button onClick={onClose} variant="outline" className="rounded-full">
                          Close
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium">
                            Your Name
                          </Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-full border-accent/30 focus:border-accent focus:glow-effect transition-all duration-300"
                            placeholder="Enter your full name"
                            disabled={!!session?.user?.name}
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone" className="text-sm font-medium">
                            Phone Number *
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                            className="rounded-full border-accent/30 focus:border-accent focus:glow-effect transition-all duration-300"
                            placeholder="+370 123 45678"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="university" className="text-sm font-medium">
                            University *
                          </Label>
                          <Select value={university} onValueChange={setUniversity} required>
                            <SelectTrigger className="rounded-full border-accent/30 focus:border-accent focus:glow-effect transition-all duration-300">
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

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="hasGuest"
                              checked={hasGuest}
                              onCheckedChange={(checked) => {
                                setHasGuest(checked as boolean)
                                if (!checked) {
                                  setGuestInfo({ name: "", email: "" })
                                }
                              }}
                            />
                            <Label htmlFor="hasGuest" className="text-sm font-medium flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              I'll bring a guest
                            </Label>
                          </div>

                          {hasGuest && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-3 pl-6 border-l-2 border-accent/30"
                            >
                              <div>
                                <Label htmlFor="guestName" className="text-sm font-medium">
                                  Guest Name *
                                </Label>
                                <Input
                                  id="guestName"
                                  value={guestInfo.name}
                                  onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                                  className="rounded-full border-accent/30 focus:border-accent focus:glow-effect transition-all duration-300"
                                  placeholder="Enter guest's full name"
                                  required={hasGuest}
                                />
                              </div>
                              <div>
                                <Label htmlFor="guestEmail" className="text-sm font-medium">
                                  Guest Email *
                                </Label>
                                <Input
                                  id="guestEmail"
                                  type="email"
                                  value={guestInfo.email}
                                  onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                                  className="rounded-full border-accent/30 focus:border-accent focus:glow-effect transition-all duration-300"
                                  placeholder="guest@example.com"
                                  required={hasGuest}
                                />
                              </div>
                            </motion.div>
                          )}
                        </div>

                        <div className="pt-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <User className="h-4 w-4" />
                            <span>
                              Booking for: {hasGuest ? "2 people (you + guest)" : "1 person (you)"}
                            </span>
                          </div>
                          
                          <Button
                            onClick={handleBooking}
                            disabled={!userPhone || !university || isSubmitting || (hasGuest && (!guestInfo.name || !guestInfo.email))}
                            className={`w-full rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                              bookingSuccess 
                                ? "bg-green-500 hover:bg-green-600" 
                                : "bg-gradient-to-r from-primary to-secondary hover:scale-105 hover:glow-effect"
                            }`}
                            size="lg"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Booking...
                              </>
                            ) : bookingSuccess ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Event Booked Successfully!
                              </>
                            ) : (
                              "Confirm Booking"
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
