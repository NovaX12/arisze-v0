"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Phone, Calendar, Clock, Users } from "lucide-react"
import Image from "next/image"

interface Cafe {
  id: number
  name: string
  thumbnail: string
  phone: string
  email: string
  activities: string[]
}

interface CafeCardProps {
  cafe: Cafe
}

export function CafeCard({ cafe }: CafeCardProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    groupSize: "",
  })

  const timeSlots = ["10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle booking submission
  }

  return (
    <motion.div whileHover={{ y: -5 }} className="glassmorphism rounded-2xl overflow-hidden group">
      <div className="aspect-video overflow-hidden relative">
        <Image
          src={cafe.thumbnail || "/placeholder.svg"}
          alt={cafe.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{cafe.name}</h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span className="text-sm">{cafe.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="text-sm">{cafe.email}</span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-white mb-3">Activities</h4>
          <div className="flex flex-wrap gap-2">
            {cafe.activities && cafe.activities.length > 0 ? cafe.activities.map((activity, index) => (
              <span key={index} className="px-3 py-1 text-xs rounded-full bg-background/50 text-muted-foreground">
                {activity}
              </span>
            )) : (
              <span className="px-3 py-1 text-xs rounded-full bg-background/50 text-muted-foreground">
                No activities listed
              </span>
            )}
          </div>
        </div>

        <Button
          onClick={() => setIsBookingOpen(!isBookingOpen)}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-all duration-300"
        >
          {isBookingOpen ? "Hide Booking" : "Book Now"}
        </Button>

        <AnimatePresence>
          {isBookingOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-6 pt-6 border-t border-border bg-background/20 -mx-6 px-6 pb-6">
                <h4 className="text-sm font-medium text-white mb-4">Book Your Visit</h4>
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4" />
                      Select Date
                    </label>
                    <Input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      className="bg-background/50 border-0"
                      min="2025-01-01"
                      max="2025-12-31"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Clock className="w-4 h-4" />
                      Select Time
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setBookingData({ ...bookingData, time })}
                          className={`px-3 py-2 text-xs rounded-full transition-all duration-200 ${
                            bookingData.time === time
                              ? "bg-gradient-to-r from-primary to-secondary text-white"
                              : "bg-background/50 text-muted-foreground hover:text-white"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Users className="w-4 h-4" />
                      Group Size
                    </label>
                    <Input
                      type="number"
                      placeholder="Number of people"
                      value={bookingData.groupSize}
                      onChange={(e) => setBookingData({ ...bookingData, groupSize: e.target.value })}
                      className="bg-background/50 border-0 placeholder:text-muted-foreground"
                      min="1"
                      max="20"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-all duration-300"
                  >
                    Confirm Booking
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
