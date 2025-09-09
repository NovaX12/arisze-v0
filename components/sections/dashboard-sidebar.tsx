"use client"

import { User, Award, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type DashboardTab = "profile" | "badges" | "events"

interface DashboardSidebarProps {
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
}

const navigationItems = [
  {
    id: "profile" as DashboardTab,
    label: "Profile",
    icon: User,
    description: "Manage your personal details",
  },
  {
    id: "badges" as DashboardTab,
    label: "My Badges",
    icon: Award,
    description: "View your achievements",
  },
  {
    id: "events" as DashboardTab,
    label: "My Events",
    icon: Calendar,
    description: "Track your bookings",
  },
]

export function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  return (
    <Card className="p-6 glassmorphism border-0 sticky top-24">
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold gradient-text mb-6">Navigation</h2>

        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start text-left h-auto py-4 px-4 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-primary to-secondary glow-effect"
                  : "hover:bg-accent/10 hover:glow-effect border border-transparent hover:border-accent/30"
              }`}
              onClick={() => onTabChange(item.id)}
              data-testid={`${item.id}-tab`}
            >
              <div className="flex items-center gap-3 w-full min-w-0">
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-white" : "text-accent"}`} />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className={`font-semibold leading-tight ${isActive ? "text-white" : "text-foreground"}`}>
                    {item.label}
                  </div>
                  <div className={`text-sm leading-tight mt-1 ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                    {item.description}
                  </div>
                </div>
              </div>
            </Button>
          )
        })}
      </div>
    </Card>
  )
}
