"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"

interface EventFilters {
  search: string
  activityTypes: string[]
}

interface EventsFiltersProps {
  filters: EventFilters
  onFiltersChange: (filters: EventFilters) => void
}

const activityTypes = [
  "Board Games",
  "Study Group",
  "Live Music",
  "Art Workshop",
  "Sports",
  "Networking",
  "Food & Drinks",
  "Academic",
  "Entertainment",
  "Social",
]

export function EventsFilters({ filters, onFiltersChange }: EventsFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleActivityTypeToggle = (activityType: string) => {
    const newActivityTypes = filters.activityTypes.includes(activityType)
      ? filters.activityTypes.filter((a: string) => a !== activityType)
      : [...filters.activityTypes, activityType]
    onFiltersChange({ ...filters, activityTypes: newActivityTypes })
  }

  return (
    <Card className="p-6 glassmorphism border-0 sticky top-24">
      <div className="space-y-6">
        {/* Search Bar */}
        <div>
          <h3 className="text-lg font-serif font-semibold mb-3">Search Events</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or activity..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 rounded-full border-accent/30 focus:border-accent focus:glow-effect transition-all duration-300"
            />
          </div>
        </div>

        {/* Activity Types */}
        <div>
          <h3 className="text-lg font-serif font-semibold mb-3">Activity Types</h3>
          <div className="space-y-3">
            {activityTypes.map((activityType) => (
              <div key={activityType} className="flex items-center space-x-3">
                <Checkbox
                  id={activityType}
                  checked={filters.activityTypes.includes(activityType)}
                  onCheckedChange={() => handleActivityTypeToggle(activityType)}
                  className="border-accent/50 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                />
                <label
                  htmlFor={activityType}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {activityType}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        <Button
          variant="ghost"
          className="w-full rounded-full border border-accent/30 hover:border-accent hover:glow-effect transition-all duration-300"
          onClick={() => onFiltersChange({ search: "", activityTypes: [] })}
        >
          Clear All Filters
        </Button>
      </div>
    </Card>
  )
}

export type { EventFilters }
