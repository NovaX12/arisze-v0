"use client"

import { Card } from "@/components/ui/card"

export function EventSkeletonCard() {
  return (
    <Card className="overflow-hidden border-0 bg-card/50 backdrop-blur-sm">
      {/* Image Skeleton */}
      <div className="relative aspect-video overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
      </div>

      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="h-6 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-pulse" />

        {/* Date */}
        <div className="h-4 w-32 bg-gradient-to-r from-muted via-muted/50 to-muted rounded animate-pulse" />

        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-full animate-pulse" />
          <div className="h-6 w-16 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-full animate-pulse" />
        </div>

        {/* Button */}
        <div className="h-10 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-full animate-pulse" />
      </div>
    </Card>
  )
}
