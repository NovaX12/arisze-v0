"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, MapPin, Sparkles } from "lucide-react"
import Image from "next/image"

interface RecommendationEvent {
  id: number
  title: string
  cafe: string
  image: string
  date: string
  tags: string[]
  attendees: number
  maxAttendees: number
  reason: string
  reasonType: "preference" | "history"
}

interface RecommendationCardProps {
  event: RecommendationEvent
}

export function RecommendationCard({ event }: RecommendationCardProps) {
  return (
    <motion.div whileHover={{ y: -6, scale: 1.02 }} transition={{ duration: 0.3 }} className="group cursor-pointer">
      <Card className="overflow-hidden border-0 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20">
        {/* For You Badge */}
        <div className="relative">
          <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-primary to-secondary text-white border-0 glow-effect">
            <Sparkles className="h-3 w-3 mr-1" />
            For You
          </Badge>
        </div>

        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Cafe Name Overlay */}
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-2 text-white">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{event.cafe}</span>
            </div>
          </div>

          {/* Attendees Badge */}
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="glassmorphism border-0">
              <Users className="h-3 w-3 mr-1" />
              {event.attendees}/{event.maxAttendees}
            </Badge>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <h3 className="text-xl font-serif font-semibold mb-2 group-hover:text-accent transition-colors">
            {event.title}
          </h3>

          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{event.date}</span>
          </div>

          {/* Recommendation Reason */}
          <div className="mb-4 p-3 bg-accent/10 rounded-2xl border border-accent/20">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-sm text-accent">
                <span className="font-medium">Recommended because</span> {event.reason}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="rounded-full border-accent/30 text-accent hover:bg-accent/10 transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Action Button */}
          <Button className="w-full rounded-full bg-gradient-to-r from-primary to-secondary hover:scale-105 hover:glow-effect transition-all duration-300">
            Book Event
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
