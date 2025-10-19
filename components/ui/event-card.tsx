"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, MapPin } from "lucide-react"
import Image from "next/image"

interface Event {
  _id: string
  title: string
  venue: string
  image: string
  date: string
  time?: string
  tags: string[]
  attendees: number
  maxAttendees: number
  description?: string
  contact?: string
  address?: string
  eventType?: string
}

interface EventCardProps {
  event: Event
  featured?: boolean
  onBookClick?: () => void
}

export function EventCard({ event, featured = false, onBookClick }: EventCardProps) {
  const cardWidth = featured ? "w-80" : "w-full"

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`${cardWidth} group cursor-pointer`}
    >
      <Card className="overflow-hidden border-0 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20">
        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Tags */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {event.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-black/50 text-white border-0 backdrop-blur-sm"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-accent transition-colors">
              {event.title}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
              {event.time && (
                <span className="ml-1">• {event.time}</span>
              )}
            </div>
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              <span>{event.attendees}/{event.maxAttendees}</span>
            </div>
          </div>

          {onBookClick && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onBookClick()
              }}
              className="w-full mt-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0 rounded-full transition-all duration-300 hover:scale-105"
              size="sm"
            >
              Book Event
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
