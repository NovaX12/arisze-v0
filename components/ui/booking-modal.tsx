"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, Clock, MapPin, Phone, Loader2, CheckCircle } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Image from "next/image"

interface Event {
  id: number
  title: string
  cafe: string
  image: string
  date: string
  tags: string[]
  attendees: number
  maxAttendees: number
  university: string
  description: string
  contact: string
  address: string
}

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
  const [studentCount, setStudentCount] = useState("1")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

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

    // Validate form data
    if (!selectedDate || !selectedTime || !name || !studentCount) {
      alert('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          venueId: event.id.toString(),
          venueName: event.cafe,
          date: selectedDate.toISOString(),
          time: selectedTime,
          groupSize: parseInt(studentCount),
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setBookingSuccess(true)
        toast.success("✅ Event booked successfully!", {
          description: `${event.cafe} on ${selectedDate.toLocaleDateString()} at ${selectedTime}`,
          duration: 4000,
        })
        
        // Close modal after showing success for 2 seconds
        setTimeout(() => {
          setBookingSuccess(false)
          onClose()
          // Reset form
          setSelectedDate(null)
          setSelectedTime("")
          setName("")
          setStudentCount("1")
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
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-accent/30 text-accent">
                        {tag}
                      </Badge>
                    ))}
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
                      />
                    </div>

                    <div>
                      <Label htmlFor="students" className="text-sm font-medium">
                        Number of Students
                      </Label>
                      <Input
                        id="students"
                        type="number"
                        min="1"
                        max="10"
                        value={studentCount}
                        onChange={(e) => setStudentCount(e.target.value)}
                        className="rounded-full border-accent/30 focus:border-accent focus:glow-effect transition-all duration-300"
                      />
                    </div>

                    <Button
                      onClick={handleBooking}
                      disabled={!selectedDate || !selectedTime || !name || isSubmitting}
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
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
