"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import type { EventFilters } from "@/app/events/page"

interface EventsFiltersProps {
  filters: EventFilters
  onFiltersChange: (filters: EventFilters) => void
}

const universities = [
  "Kaunas University of Technology",
  "Vytautas Magnus University",
  "Lithuanian University of Health Sciences",
  "Kaunas College",
  "All Universities",
]

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

  const handleUniversityToggle = (university: string) => {
    const newUniversities = filters.universities.includes(university)
      ? filters.universities.filter((u) => u !== university)
      : [...filters.universities, university]
    onFiltersChange({ ...filters, universities: newUniversities })
  }

  const handleActivityTypeToggle = (activityType: string) => {
    const newActivityTypes = filters.activityTypes.includes(activityType)
      ? filters.activityTypes.filter((a) => a !== activityType)
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
              placeholder="Search by cafe or activity..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 rounded-full border-accent/30 focus:border-accent focus:glow-effect transition-all duration-300"
            />
          </div>
        </div>

        {/* University Selector */}
        <div>
          <h3 className="text-lg font-serif font-semibold mb-3">Universities</h3>
          <div className="space-y-2">
            {universities.map((university) => (
              <Button
                key={university}
                variant={filters.universities.includes(university) ? "default" : "outline"}
                className={`w-full justify-start text-left h-auto py-3 px-4 rounded-full transition-all duration-300 ${
                  filters.universities.includes(university)
                    ? "bg-gradient-to-r from-primary to-secondary glow-effect"
                    : "border-accent/30 hover:border-accent hover:glow-effect"
                }`}
                onClick={() => handleUniversityToggle(university)}
              >
                <span className="text-sm leading-tight">{university}</span>
              </Button>
            ))}
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
          onClick={() => onFiltersChange({ search: "", universities: [], activityTypes: [] })}
        >
          Clear All Filters
        </Button>
      </div>
    </Card>
  )
}
