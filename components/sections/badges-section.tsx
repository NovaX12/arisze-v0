"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Lock, Trophy, Star, Award } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge as UIBadge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ALL_BADGES, DEFAULT_EARNED_BADGES, Badge, getBadgeById } from "@/lib/badges"

interface DraggableBadgeProps {
  badge: Badge
  isEarned: boolean
  isInShowcase?: boolean
}

function DraggableBadge({ badge, isEarned, isInShowcase = false }: DraggableBadgeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: badge.id,
    disabled: !isEarned,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getRarityColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-green-500/50 bg-green-500/10'
      case 'uncommon': return 'border-blue-500/50 bg-blue-500/10'
      case 'rare': return 'border-purple-500/50 bg-purple-500/10'
      case 'legendary': return 'border-yellow-500/50 bg-yellow-500/10'
      default: return 'border-muted/50 bg-muted/10'
    }
  }

  const getRarityIcon = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return <Award className="h-3 w-3" />
      case 'uncommon': return <Star className="h-3 w-3" />
      case 'rare': return <Trophy className="h-3 w-3" />
      case 'legendary': return <Trophy className="h-3 w-3 text-yellow-500" />
      default: return null
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...(isEarned ? listeners : {})}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
              ${getRarityColor(badge.rarity)}
              ${isEarned 
                ? 'hover:scale-105 hover:glow-effect' 
                : 'opacity-50 grayscale cursor-not-allowed'
              }
              ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''}
              ${isInShowcase ? 'min-h-[120px]' : ''}
            `}
          >
            {/* Lock overlay for unearned badges */}
            {!isEarned && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
            )}

            {/* Badge content */}
            <div className="text-center space-y-2">
              <div className="text-3xl">{badge.icon}</div>
              <div>
                <div className="font-semibold text-sm">{badge.name}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {getRarityIcon(badge.rarity)}
                  <span className="text-xs text-muted-foreground capitalize">
                    {badge.rarity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <div className="font-semibold">{badge.name}</div>
            <div className="text-sm text-muted-foreground">{badge.description}</div>
            <div className="text-xs text-muted-foreground mt-1 capitalize">
              {badge.category} • {badge.rarity}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface ShowcaseSlotProps {
  badge?: Badge
  onRemove?: () => void
}

function ShowcaseSlot({ badge, onRemove }: ShowcaseSlotProps) {
  const {
    setNodeRef,
    isOver,
  } = useSortable({
    id: badge ? `showcase-${badge.id}` : 'empty-slot',
  })

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[120px] p-4 rounded-xl border-2 border-dashed transition-all duration-300
        ${isOver 
          ? 'border-accent bg-accent/10 scale-105' 
          : 'border-muted/50 bg-muted/5'
        }
        ${badge ? 'border-solid' : ''}
      `}
    >
      {badge ? (
        <DraggableBadge badge={badge} isEarned={true} isInShowcase={true} />
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center space-y-2">
            <div className="text-2xl">+</div>
            <div className="text-xs">Drag badge here</div>
          </div>
        </div>
      )}
    </div>
  )
}

export function BadgesSection() {
  const { data: session } = useSession()
  const [earnedBadges, setEarnedBadges] = useState<string[]>(DEFAULT_EARNED_BADGES)
  const [showcaseBadges, setShowcaseBadges] = useState<string[]>(['newbie', 'profile-pro', 'early-bird'])
  const [activeId, setActiveId] = useState<string | null>(null)

  // Fetch user's earned badges from database
  useEffect(() => {
    const fetchUserBadges = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/users/profile')
          if (response.ok) {
            const result = await response.json()
            const userEarnedBadges = result.user.earnedBadges || DEFAULT_EARNED_BADGES
            setEarnedBadges(userEarnedBadges)
            // Set first few badges as showcase by default
            setShowcaseBadges(userEarnedBadges.slice(0, 3))
          }
        } catch (error) {
          console.error('Error fetching user badges:', error)
        }
      }
    }

    fetchUserBadges()
  }, [session])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // If dropping on an empty showcase slot
    if (overId === 'empty-slot') {
      if (showcaseBadges.length < 4 && !showcaseBadges.includes(activeId)) {
        const newShowcase = [...showcaseBadges, activeId]
        setShowcaseBadges(newShowcase)
        saveShowcaseBadges(newShowcase)
      }
    }
    
    // If dropping on an existing showcase badge (swap)
    if (overId.startsWith('showcase-')) {
      const targetBadgeId = overId.replace('showcase-', '')
      const newShowcase = showcaseBadges.map(id => 
        id === targetBadgeId ? activeId : id
      )
      setShowcaseBadges(newShowcase)
      saveShowcaseBadges(newShowcase)
    }

    setActiveId(null)
  }

  const removeFromShowcase = (badgeId: string) => {
    const newShowcase = showcaseBadges.filter(id => id !== badgeId)
    setShowcaseBadges(newShowcase)
    saveShowcaseBadges(newShowcase)
  }

  // Save showcase badges to user profile
  const saveShowcaseBadges = async (newShowcaseBadges: string[]) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          showcaseBadges: newShowcaseBadges
        }),
      })

      if (response.ok) {
        console.log('Showcase badges saved successfully!')
      } else {
        console.error('Failed to save showcase badges')
      }
    } catch (error) {
      console.error('Error saving showcase badges:', error)
    }
  }

  const earnedBadgeObjects = earnedBadges.map(id => getBadgeById(id)).filter(Boolean) as Badge[]
  const showcaseBadgeObjects = showcaseBadges.map(id => getBadgeById(id)).filter(Boolean) as Badge[]

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
        {/* Badge Showcase */}
        <Card className="p-8 glassmorphism border-0">
          <div className="mb-6">
            <h3 className="text-2xl font-serif font-bold gradient-text mb-2">Badge Showcase</h3>
            <p className="text-muted-foreground">
              Display your favorite badges for others to see. Drag earned badges from your inventory below.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SortableContext items={showcaseBadges} strategy={verticalListSortingStrategy}>
              {Array.from({ length: 4 }, (_, index) => {
                const badge = showcaseBadgeObjects[index]
                return (
                  <ShowcaseSlot
                    key={index}
                    badge={badge}
                    onRemove={() => badge && removeFromShowcase(badge.id)}
                  />
                )
              })}
            </SortableContext>
          </div>
        </Card>

        {/* Badge Inventory */}
        <Card className="p-8 glassmorphism border-0">
          <div className="mb-6">
            <h3 className="text-2xl font-serif font-bold gradient-text mb-2">Badge Collection</h3>
            <p className="text-muted-foreground">
              Earn badges by participating in events and activities. Locked badges show what you can achieve!
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 rounded-xl bg-muted/10">
              <div className="text-2xl font-bold gradient-text">{earnedBadges.length}</div>
              <div className="text-sm text-muted-foreground">Earned</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/10">
              <div className="text-2xl font-bold gradient-text">{ALL_BADGES.length - earnedBadges.length}</div>
              <div className="text-sm text-muted-foreground">Locked</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/10">
              <div className="text-2xl font-bold gradient-text">{Math.round((earnedBadges.length / ALL_BADGES.length) * 100)}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/10">
              <div className="text-2xl font-bold gradient-text">{showcaseBadges.length}/4</div>
              <div className="text-sm text-muted-foreground">Showcased</div>
            </div>
          </div>

          {/* Badge Grid */}
          <SortableContext items={earnedBadges} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {ALL_BADGES.map((badge) => (
                <DraggableBadge
                  key={badge.id}
                  badge={badge}
                  isEarned={earnedBadges.includes(badge.id)}
                />
              ))}
            </div>
          </SortableContext>
        </Card>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <DraggableBadge
              badge={getBadgeById(activeId)!}
              isEarned={true}
            />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}